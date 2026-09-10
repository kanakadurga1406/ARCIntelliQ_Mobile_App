import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  clearBusinessCache,
  enterBusiness,
  fetchClaimPortalsDashboard,
  fetchClaimPortalsPage,
  PORTAL_PAGE_SIZE,
  profileFromUser,
} from '../api/business';
import {clearSession} from '../api/session';
import {openEnteredWorkspace} from '../utils/enteredPortalNav';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {PageBackdrop} from '../components/claimPortals/PageBackdrop';
import {PageHero} from '../components/claimPortals/PageHero';
import {
  FilterSheet,
  PortalActionsSheet,
} from '../components/claimPortals/ClaimPortalSheets';
import {PortalCard} from '../components/claimPortals/PortalCard';
import {PortalListControls} from '../components/claimPortals/PortalListControls';
import {SideDrawer} from '../components/claimPortals/SideDrawer';
import {
  DashboardTabBody,
  ProfileTabBody,
} from '../components/claimPortals/TabPlaceholders';
import {FadeSlideIn} from '../components/ui/Motion';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {
  ClaimPortal,
  ClaimPortalsDashboard,
  PortalAction,
  PortalFilters,
  SortOption,
  StatusChip,
} from '../types/claimPortals';
import type {ClaimPortalsScreenProps} from '../types/navigation';
import {mergeUniquePortals} from '../utils/portalList';
import {hubMenuItems} from '../utils/hubMenu';

const DEFAULT_FILTERS: PortalFilters = {
  status: 'all',
  fromDate: '',
  toDate: '',
  sortBy: 'latest',
};


function portalValue(portal: ClaimPortal, field: string): string {
  const fromValues = portal.values?.[field];
  if (fromValues !== undefined) {
    return String(fromValues);
  }
  if (field === 'name') {
    return portal.name;
  }
  if (field === 'createdAt') {
    return portal.createdAt;
  }
  if (field === 'status') {
    return portal.status;
  }
  return '';
}

function applyPortalFilters(
  portals: ClaimPortal[],
  query: string,
  filters: PortalFilters,
  chips: StatusChip[],
  sortOptions: SortOption[],
): ClaimPortal[] {
  const normalizedQuery = query.trim().toLowerCase();
  const chip = chips.find(item => item.id === filters.status);

  const filtered = (portals ?? []).filter(portal => {
    const matchesQuery =
      !normalizedQuery ||
      portal.name.toLowerCase().includes(normalizedQuery) ||
      portal.businessId.toLowerCase().includes(normalizedQuery);

    const matchesChip = !chip?.filter
      ? true
      : chip.filter.field === 'status'
        ? portal.status === chip.filter.value
        : (portal.flags ?? []).includes(chip.filter.value);

    const matchesFrom = !filters.fromDate || portal.createdAt >= filters.fromDate;
    const matchesTo = !filters.toDate || portal.createdAt <= filters.toDate;

    return matchesQuery && matchesChip && matchesFrom && matchesTo;
  });

  const sort = sortOptions.find(item => item.id === filters.sortBy);

  return filtered.sort((left, right) => {
    const field = sort?.field ?? 'createdAt';
    const direction = sort?.direction ?? 'desc';
    const comparison = portalValue(left, field).localeCompare(
      portalValue(right, field),
    );
    return direction === 'asc' ? comparison : -comparison;
  });
}

function countActiveFilters(filters: PortalFilters): number {
  return [
    filters.status !== 'all',
    Boolean(filters.fromDate),
    Boolean(filters.toDate),
  ].filter(Boolean).length;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const ClaimPortalsScreen = ({navigation, route}: ClaimPortalsScreenProps) => {
  const insets = useSafeAreaInsets();
  const user = route.params.user;

  const [activeTab, setActiveTab] = useState('portals');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<ClaimPortal | null>(null);
  const [query, setQuery] = useState('');
  const [searchFocusToken, setSearchFocusToken] = useState(0);
  const [filters, setFilters] = useState<PortalFilters>(DEFAULT_FILTERS);
  const [dashboard, setDashboard] = useState<ClaimPortalsDashboard | null>(null);
  const [portals, setPortals] = useState<ClaimPortal[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [listError, setListError] = useState('');
  const [toast, setToast] = useState('');
  const [enteringName, setEnteringName] = useState('');

  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const debouncedQuery = useDebouncedValue(query, 320);
  const requestSeqRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const portalsRef = useRef<ClaimPortal[]>([]);
  const enteringRef = useRef(false);
  const previousTabRef = useRef('portals');
  const profileOpenedFromStackRef = useRef(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage('');

    try {
      const data = await fetchClaimPortalsDashboard();
      setDashboard(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load claim portals.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadPortalPage = useCallback(
    async (nextPage: number, mode: 'replace' | 'append') => {
      if (mode === 'append') {
        if (loadingMoreRef.current || !hasMoreRef.current) {
          return;
        }
        loadingMoreRef.current = true;
        setIsLoadingMore(true);
      } else {
        requestSeqRef.current += 1;
        hasMoreRef.current = true;
        if (portalsRef.current.length === 0) {
          setIsListLoading(true);
        }
      }

      const requestId = requestSeqRef.current;
      setListError('');

      try {
        const result = await fetchClaimPortalsPage({
          page: nextPage,
          limit: PORTAL_PAGE_SIZE,
          search: debouncedQuery,
          filters,
        });

        if (requestId !== requestSeqRef.current) {
          return;
        }

        hasMoreRef.current = result.hasMore;
        setHasMore(result.hasMore);
        setPage(result.page);
        setListTotal(result.total);
        setPortals(current => {
          const items = result.items ?? [];
          const next =
            mode === 'replace'
              ? items
              : mergeUniquePortals(current, items);
          portalsRef.current = next;
          return next;
        });
      } catch (error) {
        if (requestId !== requestSeqRef.current) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load claim portals.';
        if (mode === 'replace' && portalsRef.current.length === 0) {
          setListError(message);
        } else {
          showToast(message);
        }
      } finally {
        if (mode === 'append') {
          loadingMoreRef.current = false;
          setIsLoadingMore(false);
        } else if (requestId === requestSeqRef.current) {
          setIsListLoading(false);
        }
      }
    },
    [debouncedQuery, filters, showToast],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadPortalPage(1, 'replace');
  }, [loadPortalPage]);

  useFocusEffect(
    useCallback(() => {
      const nextTab =
        route.params.initialTab === 'home'
          ? 'portals'
          : route.params.initialTab;
      if (nextTab) {
        if (nextTab === 'profile') {
          profileOpenedFromStackRef.current = true;
        }
        setActiveTab(nextTab);
        navigation.setParams({initialTab: undefined, openAddClaim: undefined});
      }
    }, [
      navigation,
      route.params.initialTab,
    ]),
  );

  const refreshPortalsTab = useCallback(async () => {
    setIsRefreshing(true);
    try {
      clearBusinessCache();
      await Promise.all([loadPortalPage(1, 'replace'), loadDashboard(true)]);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadDashboard, loadPortalPage]);

  const visiblePortals = useMemo(
    () =>
      applyPortalFilters(
        portals,
        query,
        filters,
        dashboard?.statusChips ?? [],
        dashboard?.sortOptions ?? [],
      ),
    [portals, query, filters, dashboard],
  );

  const tabDestinations = useMemo(() => {
    return new Set(
      (dashboard?.bottomTabs ?? [])
        .filter(item => item.style !== 'fab')
        .map(item => item.destination),
    );
  }, [dashboard]);

  const signOut = useCallback(() => {
    clearSession();
    clearBusinessCache();
    navigation.reset({
      index: 0,
      routes: [{name: 'PortalSelect'}],
    });
  }, [navigation]);

  const requestSignOut = useCallback(() => {
    showDialog({
      title: 'Sign out',
      message: 'You will need to sign in again to access claim portals.',
      buttons: [
        {label: 'Cancel'},
        {label: 'Sign out', tone: 'destructive', onPress: signOut},
      ],
    });
  }, [showDialog, signOut]);

  const openSearch = useCallback(() => {
    setActiveTab('portals');
    setSearchFocusToken(current => current + 1);
  }, []);

  const openClaimHistory = useCallback(
    async (portal: ClaimPortal) => {
      const businessId = String(portal.businessId || portal.id || '').trim();
      if (!businessId) {
        showDialog({
          title: 'Unable to enter',
          message: 'This business has no ID from the API.',
          buttons: [{label: 'OK'}],
        });
        return;
      }
      if (enteringRef.current) {
        return;
      }

      enteringRef.current = true;
      setEnteringName(portal.name);
      try {
        const entered = await enterBusiness(businessId);
        openEnteredWorkspace(navigation, user, entered);
      } catch (error) {
        showDialog({
          title: 'Unable to enter',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to enter this business.',
          buttons: [{label: 'OK'}],
        });
      } finally {
        enteringRef.current = false;
        setEnteringName('');
      }
    },
    [navigation, showDialog, user],
  );

  const openProfile = useCallback(() => {
    if (activeTab !== 'profile') {
      previousTabRef.current = activeTab;
    }
    profileOpenedFromStackRef.current = false;
    setActiveTab('profile');
  }, [activeTab]);

  const closeProfile = useCallback(() => {
    if (profileOpenedFromStackRef.current && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    const nextTab =
      previousTabRef.current && previousTabRef.current !== 'profile'
        ? previousTabRef.current
        : 'portals';
    setActiveTab(nextTab);
  }, [navigation]);

  useEffect(() => {
    if (activeTab !== 'profile') {
      return;
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeProfile();
        return true;
      },
    );
    return () => subscription.remove();
  }, [activeTab, closeProfile]);

  const handleDestination = useCallback(
    (destination: string) => {
      setDrawerOpen(false);
      if (destination === 'home') {
        setActiveTab('portals');
        return;
      }
      if (destination === 'profile') {
        openProfile();
        return;
      }
      if (tabDestinations.has(destination)) {
        setActiveTab(destination);
        return;
      }
      if (destination === 'search') {
        openSearch();
        return;
      }
      if (destination === 'sign-out') {
        signOut();
        return;
      }
      if (destination === 'faqs') {
        navigation.navigate('Faqs');
        return;
      }
      if (destination === 'smart-search') {
        navigation.navigate('SmartSearch');
        return;
      }
      showToast('This option will connect when the live API is ready.');
    },
    [
      navigation,
      openSearch,
      showToast,
      signOut,
      openProfile,
      tabDestinations,
    ],
  );

  const handleStatusChange = (status: string) => {
    setFilters(current => ({...current, status}));
  };

  const handleSortPress = () => {
    const order = dashboard?.sortOptions ?? [];
    if (order.length === 0) {
      return;
    }
    setFilters(current => {
      const index = order.findIndex(item => item.id === current.sortBy);
      return {...current, sortBy: order[(index + 1) % order.length].id};
    });
  };

  const handlePortalAction = (action: PortalAction) => {
    const portal = selectedPortal;
    setSelectedPortal(null);
    if (!portal) {
      return;
    }

    const destination = action.destination || action.id;

    if (destination === 'view') {
      openClaimHistory(portal);
      return;
    }
    handleDestination(destination);
  };

  const renderPortals = () => {
    if (isListLoading && portals.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.helper, {color: theme.textSecondary}]}>
            Loading claim portals...
          </Text>
        </View>
      );
    }

    if (listError && portals.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.helper, {color: theme.danger}]}>
            {listError}
          </Text>
          <Pressable
            onPress={() => loadPortalPage(1, 'replace')}
            style={[styles.retry, {backgroundColor: theme.primary}]}>
            <Text style={[styles.retryText, {color: theme.onPrimary}]}>
              Try again
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={visiblePortals}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({item}) => (
          <PortalCard
            theme={theme}
            portal={item}
            onPress={() => openClaimHistory(item)}
            onMenuPress={() => setSelectedPortal(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHero
              icon="building"
              title={dashboard?.portalsPage?.title || 'Claim Portals'}
              subtitle={
                dashboard?.portalsPage?.subtitle ||
                'Manage and monitor all business portals'
              }
            />
            {dashboard ? (
              <PortalListControls
                theme={theme}
                query={query}
                onQueryChange={setQuery}
                chips={dashboard.statusChips ?? []}
                activeStatus={filters.status}
                onStatusChange={handleStatusChange}
                filterCount={countActiveFilters(filters)}
                sortOptions={dashboard.sortOptions ?? []}
                sortBy={filters.sortBy}
                onSortPress={handleSortPress}
                onFilterPress={() => setFilterOpen(true)}
                resultCount={listTotal}
                loadedCount={portals.length}
                searchFocusToken={searchFocusToken}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isListLoading ? undefined : (
            <Text style={[styles.empty, {color: theme.textSecondary}]}>
              No portals match your search or filters.
            </Text>
          )
        }
        ListFooterComponent={
          <View style={styles.listFooter}>
            {isLoadingMore ? (
              <View style={styles.moreRow}>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.moreText, {color: theme.textSecondary}]}>
                  Loading more portals...
                </Text>
              </View>
            ) : null}
            {!hasMore && portals.length > 0 ? (
              <Text style={[styles.endText, {color: theme.textMuted}]}>
                All {listTotal} portals loaded
              </Text>
            ) : null}
            <Text style={[styles.footer, {color: theme.textMuted}]}>
              © 2026 ARC Global Risk · Powered by WebAppClouds
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!isListLoading && !isRefreshing) {
            loadPortalPage(page + 1, 'append');
          }
        }}
        onEndReachedThreshold={0.35}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshPortalsTab}
            tintColor={theme.primary}
          />
        }
      />
    );
  };

  return (
    <View style={styles.root}>
      <PageBackdrop />
      <StatusBar barStyle="dark-content" />
      <AppHeader
        theme={theme}
        userName={user.name}
        topInset={insets.top}
        onMenuPress={() => setDrawerOpen(true)}
        onFaqsPress={() => navigation.navigate('Faqs')}
        onProfilePress={openProfile}
      />

      <View style={styles.body}>
        {activeTab === 'portals' ? (
          <FadeSlideIn key="portals" distance={8} style={styles.body}>
            {renderPortals()}
          </FadeSlideIn>
        ) : null}
        {activeTab === 'dashboard' ? (
          <FadeSlideIn key="dashboard" distance={8} style={styles.body}>
          <DashboardTabBody
            theme={theme}
            dashboard={dashboard?.dashboard ?? null}
            isRefreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            onAction={handleDestination}
          />
          </FadeSlideIn>
        ) : null}
        {activeTab === 'profile' ? (
          <FadeSlideIn key="profile" distance={8} style={styles.body}>
          <ProfileTabBody
            theme={theme}
            user={user}
            page={profileFromUser(user)}
            extraFields={[]}
            onSignOut={requestSignOut}
            onBack={closeProfile}
          />
          </FadeSlideIn>
        ) : null}
        {activeTab !== 'portals' &&
        activeTab !== 'dashboard' &&
        activeTab !== 'profile' ? (
          <View style={styles.centered}>
            <Text style={[styles.pageTitle, {color: theme.text}]}>
              {(dashboard?.bottomTabs ?? []).find(
                item => item.destination === activeTab,
              )?.label || 'New section'}
            </Text>
            <Text style={[styles.helper, {color: theme.textSecondary}]}>
              This screen was sent by the API and will render its own content
              when that endpoint is connected.
            </Text>
          </View>
        ) : null}
      </View>

      {toast ? (
        <View
          style={[
            styles.toast,
            {bottom: 24 + insets.bottom, backgroundColor: theme.text},
          ]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <SideDrawer
        visible={drawerOpen}
        theme={theme}
        user={user}
        menuItems={hubMenuItems(dashboard?.menuItems ?? [])}
        activeDestination={activeTab}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleDestination}
      />

      <FilterSheet
        visible={filterOpen}
        theme={theme}
        value={filters}
        statusChips={dashboard?.statusChips ?? []}
        sortOptions={dashboard?.sortOptions ?? []}
        onClose={() => setFilterOpen(false)}
        onApply={next => {
          setFilters(next);
          setFilterOpen(false);
        }}
      />

      <PortalActionsSheet
        visible={Boolean(selectedPortal)}
        theme={theme}
        portal={selectedPortal}
        actions={dashboard?.portalActions ?? []}
        onClose={() => setSelectedPortal(null)}
        onAction={handlePortalAction}
      />

      {enteringName ? (
        <View style={styles.enteringOverlay} pointerEvents="auto">
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={[styles.enteringText, {color: theme.text}]}>
            Entering {enteringName}...
          </Text>
        </View>
      ) : null}

      <AppDialog
        visible={dialog.visible}
        theme={theme}
        title={dialog.title}
        message={dialog.message}
        buttons={dialog.buttons}
        onClose={hideDialog}
      />
    </View>
  );
};

export default ClaimPortalsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  headerBlock: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  pageTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  pageSubtitle: {
    marginTop: 2,
    marginBottom: 12,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  helper: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  retry: {
    marginTop: 14,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  listFooter: {
    paddingTop: 4,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  moreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  endText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontSize: 11,
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    zIndex: 30,
  },
  toastText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  enteringOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    zIndex: 40,
    gap: 12,
    paddingHorizontal: 24,
  },
  enteringText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});


