import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  ActivityIndicator,
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
  fetchClaimPortalsDashboard,
  fetchClaimPortalsPage,
  PORTAL_PAGE_SIZE,
} from '../api/claimPortals';
import {clearSession} from '../api/session';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {
  BusinessRequestsSheet,
  FilterSheet,
  PortalActionsSheet,
} from '../components/claimPortals/ClaimPortalSheets';
import {IntakeWizard} from '../components/claimPortals/IntakeWizard';
import type {IntakeDraft} from '../types/intake';
import {PortalCard} from '../components/claimPortals/PortalCard';
import {PortalListControls} from '../components/claimPortals/PortalListControls';
import {SideDrawer} from '../components/claimPortals/SideDrawer';
import {
  DashboardTabBody,
  HomeTabBody,
  ProfileTabBody,
} from '../components/claimPortals/TabPlaceholders';
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
import {INTAKE_CONFIG} from '../api/stubs/intake';
import {PROFILE_PAGE} from '../api/stubs/profile';
import {mergeUniquePortals} from '../utils/portalList';

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

  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [addClaimOpen, setAddClaimOpen] = useState(false);
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

  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const debouncedQuery = useDebouncedValue(query, 320);
  const requestSeqRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const portalsRef = useRef<ClaimPortal[]>([]);

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
      const nextTab = route.params.initialTab;
      const shouldOpenAddClaim = route.params.openAddClaim;
      if (nextTab) {
        setActiveTab(nextTab);
      }
      if (shouldOpenAddClaim) {
        setAddClaimOpen(true);
      }
      if (nextTab || shouldOpenAddClaim) {
        navigation.setParams({initialTab: undefined, openAddClaim: undefined});
      }
    }, [
      navigation,
      route.params.initialTab,
      route.params.openAddClaim,
    ]),
  );

  const refreshPortalsTab = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPortalPage(1, 'replace');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPortalPage]);

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

  const openAddClaim = useCallback(() => {
    setAddClaimOpen(true);
  }, []);

  const openSearch = useCallback(() => {
    setActiveTab('portals');
    setSearchFocusToken(current => current + 1);
  }, []);

  const openClaimHistory = useCallback(
    (portal: ClaimPortal) => {
      navigation.navigate('ClaimHistory', {
        user,
        portalId: portal.id,
        portalName: portal.name,
      });
    },
    [navigation, user],
  );

  const handleDestination = useCallback(
    (destination: string) => {
      setDrawerOpen(false);
      if (tabDestinations.has(destination)) {
        setActiveTab(destination);
        return;
      }
      if (destination === 'add-claim') {
        openAddClaim();
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
      if (destination === 'requests') {
        setRequestsOpen(true);
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
      openAddClaim,
      openSearch,
      showToast,
      signOut,
      tabDestinations,
    ],
  );

  const handleAddClaimSubmit = useCallback(
    (draft: IntakeDraft) => {
      setAddClaimOpen(false);
      const portalName = portals.find(item => item.id === draft.portalId)?.name;
      const label =
        [draft.claimType, draft.driverLastName || draft.callerName]
          .filter(Boolean)
          .join(' · ') || 'Intake';
      showToast(
        portalName
          ? `${label} submitted for ${portalName}. Live API comes next.`
          : `${label} submitted on this device. Live API comes next.`,
      );
    },
    [portals, showToast],
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
    if (destination === 'delete') {
      setPortals(current => current.filter(item => item.id !== portal.id));
      showToast(`${portal.name} removed from this device list.`);
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
        keyExtractor={item => item.id}
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
            <Text style={[styles.pageTitle, {color: theme.text}]}>
              {dashboard?.portalsPage?.title || 'Claim Portals'}
            </Text>
            <Text style={[styles.pageSubtitle, {color: theme.textSecondary}]}>
              {dashboard?.portalsPage?.subtitle ||
                'Manage and monitor all business portals'}
            </Text>
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
    <View style={[styles.root, {backgroundColor: theme.page}]}>
      <StatusBar barStyle="dark-content" />
      <View style={{height: insets.top, backgroundColor: theme.page}} />
      <AppHeader
        theme={theme}
        userName={user.name}
        onMenuPress={() => setDrawerOpen(true)}
        onFaqsPress={() => navigation.navigate('Faqs')}
        onProfilePress={() => setActiveTab('profile')}
      />

      <View style={styles.body}>
        {activeTab === 'portals' ? renderPortals() : null}
        {activeTab === 'home' ? (
          <HomeTabBody
            theme={theme}
            user={user}
            subtitle={dashboard?.home?.subtitle ?? ''}
            actions={dashboard?.home?.actions ?? []}
            statCards={dashboard?.statCards ?? null}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            errorMessage={errorMessage}
            onRefresh={() => loadDashboard(true)}
            onRetry={() => loadDashboard()}
            onAction={handleDestination}
            onStatPress={card =>
              card.destination ? handleDestination(card.destination) : undefined
            }
          />
        ) : null}
        {activeTab === 'dashboard' ? (
          <DashboardTabBody
            theme={theme}
            dashboard={dashboard?.dashboard ?? null}
            isRefreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            onAction={handleDestination}
          />
        ) : null}
        {activeTab === 'profile' ? (
          <ProfileTabBody
            theme={theme}
            user={user}
            page={dashboard?.profile ?? PROFILE_PAGE}
            extraFields={
              dashboard?.profileFields ?? dashboard?.profile?.fields ?? []
            }
            onSignOut={requestSignOut}
          />
        ) : null}
        {activeTab !== 'home' &&
        activeTab !== 'portals' &&
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
        menuItems={dashboard?.menuItems ?? []}
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

      <BusinessRequestsSheet
        visible={requestsOpen}
        theme={theme}
        rows={dashboard?.requestSummary ?? []}
        onClose={() => setRequestsOpen(false)}
        onViewAll={() => {
          setRequestsOpen(false);
          setActiveTab('dashboard');
        }}
      />

      <IntakeWizard
        visible={addClaimOpen}
        theme={theme}
        portals={portals}
        config={dashboard?.intake ?? INTAKE_CONFIG}
        onClose={() => setAddClaimOpen(false)}
        onSubmit={handleAddClaimSubmit}
      />

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
});


