import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fetchClaimPortalsDashboard} from '../api/claimPortals';
import {CLAIM_PAGE_SIZE, fetchClaimHistory} from '../api/claims';
import {clearSession} from '../api/session';
import {INTAKE_CONFIG} from '../api/stubs/intake';
import {ClaimCard} from '../components/claims/ClaimCard';
import {ClaimDetailSheet} from '../components/claims/ClaimDetailSheet';
import {ClaimFilterSheet} from '../components/claims/ClaimFilterSheet';
import {IntakeWizard} from '../components/claimPortals/IntakeWizard';
import {KpiGrid} from '../components/claimPortals/KpiGrid';
import {PortalListControls} from '../components/claimPortals/PortalListControls';
import {SideDrawer} from '../components/claimPortals/SideDrawer';
import {MenuIcon} from '../components/claimPortals/ClaimPortalsIcons';
import {UiIcon} from '../components/claimPortals/UiIcon';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {
  ClaimPortal,
  NavItem,
  PageAction,
  PortalAction,
  StatCard,
} from '../types/claimPortals';
import type {IntakeConfig, IntakeDraft} from '../types/intake';
import type {
  ClaimFilters,
  ClaimHistoryConfig,
  ClaimRecord,
} from '../types/claims';
import type {ClaimHistoryScreenProps} from '../types/navigation';
import {mergeUniqueClaims} from '../utils/claimList';

const SIDEBAR_DESTINATIONS = new Set([
  'smart-search',
  'profile',
  'dashboard',
  'portals',
  'home',
  'sign-out',
  'faqs',
]);

function isFabAction(action: PageAction): boolean {
  return action.style === 'fab' || action.destination === 'add-claim';
}

function defaultFilters(config?: ClaimHistoryConfig | null): ClaimFilters {
  return {
    status: 'all',
    sortBy: config?.sortOptions[0]?.id ?? 'latest',
    dateField: config?.dateFilters[0]?.id ?? 'doi',
    fromDate: '',
    toDate: '',
    extras: Object.fromEntries(
      (config?.filterControls ?? []).map(control => [control.id, 'all']),
    ),
  };
}

function countActiveFilters(filters: ClaimFilters): number {
  return [
    ...Object.values(filters.extras).filter(value => value && value !== 'all'),
    filters.fromDate,
    filters.toDate,
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

const ClaimHistoryScreen = ({navigation, route}: ClaimHistoryScreenProps) => {
  const insets = useSafeAreaInsets();
  const {user, portalId, portalName} = route.params;
  const theme = useMemo(() => getClaimPortalTheme('light'), []);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ClaimFilters>(defaultFilters());
  const [config, setConfig] = useState<ClaimHistoryConfig | null>(null);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addClaimOpen, setAddClaimOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavItem[]>([]);
  const [portals, setPortals] = useState<ClaimPortal[]>([]);
  const [intakeConfig, setIntakeConfig] = useState<IntakeConfig>(INTAKE_CONFIG);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [toast, setToast] = useState('');

  const debouncedQuery = useDebouncedValue(query, 320);
  const requestSeqRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const claimsRef = useRef<ClaimRecord[]>([]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const loadPage = useCallback(
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
        if (claimsRef.current.length === 0) {
          setIsListLoading(true);
        }
      }

      const requestId = requestSeqRef.current;
      setListError('');

      try {
        const result = await fetchClaimHistory({
          portalId,
          portalName,
          page: nextPage,
          limit: CLAIM_PAGE_SIZE,
          search: debouncedQuery,
          filters,
        });

        if (requestId !== requestSeqRef.current) {
          return;
        }

        setConfig(result.config);
        hasMoreRef.current = result.list.hasMore;
        setHasMore(result.list.hasMore);
        setPage(result.list.page);
        setListTotal(result.list.total);
        setClaims(current => {
          const next =
            mode === 'replace'
              ? result.list.items
              : mergeUniqueClaims(current, result.list.items);
          claimsRef.current = next;
          return next;
        });
      } catch (error) {
        if (requestId !== requestSeqRef.current) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Unable to load claims.';
        if (mode === 'replace' && claimsRef.current.length === 0) {
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
    [debouncedQuery, filters, portalId, portalName, showToast],
  );

  useEffect(() => {
    loadPage(1, 'replace');
  }, [loadPage]);

  useEffect(() => {
    let cancelled = false;
    fetchClaimPortalsDashboard()
      .then(data => {
        if (!cancelled) {
          setMenuItems(data.menuItems);
          setPortals(data.portals);
          setIntakeConfig(data.intake ?? INTAKE_CONFIG);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDrawerNavigate = useCallback(
    (destination: string) => {
      setDrawerOpen(false);
      if (destination === 'sign-out') {
        clearSession();
        navigation.reset({
          index: 0,
          routes: [{name: 'PortalSelect'}],
        });
        return;
      }
      if (destination === 'smart-search') {
        navigation.navigate('SmartSearch');
        return;
      }
      if (destination === 'faqs') {
        navigation.navigate('Faqs');
        return;
      }
      if (destination === 'add-claim') {
        setAddClaimOpen(true);
        return;
      }
      if (
        destination === 'home' ||
        destination === 'portals' ||
        destination === 'dashboard' ||
        destination === 'profile'
      ) {
        navigation.navigate('ClaimPortals', {user, initialTab: destination});
        return;
      }
      showToast('This option will connect when the live API is ready.');
    },
    [navigation, showToast, user],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPage(1, 'replace');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPage]);

  const handleStatPress = (card: StatCard) => {
    const destination = card.destination ?? '';
    if (destination.startsWith('filter:')) {
      setFilters(current => ({
        ...current,
        status: destination.slice('filter:'.length),
      }));
    }
  };

  const handlePageAction = (destination: string) => {
    if (destination === 'add-claim') {
      setAddClaimOpen(true);
      return;
    }
    if (destination === 'smart-search') {
      navigation.navigate('SmartSearch');
      return;
    }
    showToast('This option will connect when the live API is ready.');
  };

  const handleAddClaimSubmit = useCallback(
    (draft: IntakeDraft) => {
      setAddClaimOpen(false);
      const label =
        [draft.claimType, draft.driverLastName || draft.callerName]
          .filter(Boolean)
          .join(' · ') || 'Intake';
      showToast(`${label} submitted for ${portalName}. Live API comes next.`);
    },
    [portalName, showToast],
  );

  const fabActions = (config?.pageActions ?? []).filter(isFabAction);
  const inlineActions = (config?.pageActions ?? []).filter(
    action =>
      !isFabAction(action) && !SIDEBAR_DESTINATIONS.has(action.destination),
  );
  const intakePortals = useMemo(() => {
    if (portals.some(item => item.id === portalId)) {
      return portals;
    }
    return [
      {
        id: portalId,
        name: portalName,
        status: 'active',
        createdAt: '',
        businessId: '',
        meta: [],
        metrics: [],
      },
      ...portals,
    ];
  }, [portalId, portalName, portals]);

  const handleClaimAction = (action: PortalAction) => {
    const claim = selectedClaim;
    setSelectedClaim(null);
    if (!claim) {
      return;
    }
    if (action.destination === 'view') {
      return;
    }
    showToast(
      `${action.label} for ${claim.incidentNumber} will connect to the live API.`,
    );
  };

  const renderBody = () => {
    if (isListLoading && claims.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.helper, {color: theme.textSecondary}]}>
            Loading claim history...
          </Text>
        </View>
      );
    }

    if (listError && claims.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.helper, {color: theme.danger}]}>{listError}</Text>
          <Pressable
            onPress={() => loadPage(1, 'replace')}
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
        data={claims}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ClaimCard
            theme={theme}
            claim={item}
            onPress={() => setSelectedClaim(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {config?.statCards?.length ? (
              <View style={styles.kpiWrap}>
                <KpiGrid
                  theme={theme}
                  cards={config.statCards}
                  onCardPress={handleStatPress}
                />
              </View>
            ) : null}
            {inlineActions.map(action => (
              <Pressable
                key={action.id}
                onPress={() => handlePageAction(action.destination)}
                style={[styles.pageAction, {backgroundColor: theme.primary}]}>
                <Text style={[styles.pageActionText, {color: theme.onPrimary}]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
            {config ? (
              <PortalListControls
                theme={theme}
                query={query}
                onQueryChange={setQuery}
                chips={config.statusChips}
                activeStatus={filters.status}
                onStatusChange={status =>
                  setFilters(current => ({...current, status}))
                }
                filterCount={countActiveFilters(filters)}
                sortOptions={config.sortOptions}
                sortBy={filters.sortBy}
                onSortPress={() => {
                  const order = config.sortOptions;
                  if (order.length === 0) {
                    return;
                  }
                  setFilters(current => {
                    const index = order.findIndex(item => item.id === current.sortBy);
                    return {
                      ...current,
                      sortBy: order[(index + 1) % order.length].id,
                    };
                  });
                }}
                onFilterPress={() => setFilterOpen(true)}
                resultCount={listTotal}
                loadedCount={claims.length}
                searchPlaceholder="Search claims..."
                countNoun="claims"
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, {color: theme.textSecondary}]}>
            No claims match your search or filters.
          </Text>
        }
        ListFooterComponent={
          <View style={styles.listFooter}>
            {isLoadingMore ? (
              <View style={styles.moreRow}>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.moreText, {color: theme.textSecondary}]}>
                  Loading more claims...
                </Text>
              </View>
            ) : null}
            {!hasMore && claims.length > 0 ? (
              <Text style={[styles.endText, {color: theme.textMuted}]}>
                All {listTotal} claims loaded
              </Text>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!isListLoading && !isRefreshing) {
            loadPage(page + 1, 'append');
          }
        }}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
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
      <View style={styles.header}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={8}
          style={({pressed}) => [
            styles.iconButton,
            {backgroundColor: theme.card, borderColor: theme.border},
            pressed && {opacity: 0.8},
          ]}>
          <MenuIcon color={theme.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.headerTitle, {color: theme.text}]} numberOfLines={1}>
            {config?.title || 'Claim History'}
          </Text>
          <Text
            style={[styles.headerSubtitle, {color: theme.textSecondary}]}
            numberOfLines={1}>
            {config?.subtitle || portalName}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {renderBody()}

      {fabActions.length > 0 ? (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.tabBar,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}>
          {fabActions.map(action => (
            <Pressable
              key={action.id}
              onPress={() => handlePageAction(action.destination)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({pressed}) => [
                styles.fabSlot,
                pressed && {opacity: 0.88},
              ]}>
              <LinearGradient
                colors={['#3C8CFF', '#1E5EFF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.fab}>
                <UiIcon
                  name={action.icon || 'plus'}
                  color="#FFFFFF"
                  size={22}
                />
              </LinearGradient>
              <Text style={[styles.fabLabel, {color: theme.textMuted}]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {toast ? (
        <View
          style={[
            styles.toast,
            {
              bottom: (fabActions.length > 0 ? 88 : 24) + insets.bottom,
              backgroundColor: theme.text,
            },
          ]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <SideDrawer
        visible={drawerOpen}
        theme={theme}
        user={user}
        portalName={portalName}
        menuItems={menuItems}
        activeDestination="portals"
        topInset={insets.top}
        bottomInset={insets.bottom}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleDrawerNavigate}
      />

      <ClaimFilterSheet
        visible={filterOpen}
        theme={theme}
        value={filters}
        filterControls={config?.filterControls ?? []}
        dateFilters={config?.dateFilters ?? []}
        sortOptions={config?.sortOptions ?? []}
        onClose={() => setFilterOpen(false)}
        onApply={next => {
          setFilters(next);
          setFilterOpen(false);
        }}
      />

      <ClaimDetailSheet
        visible={Boolean(selectedClaim)}
        theme={theme}
        claim={selectedClaim}
        actions={config?.claimActions ?? []}
        onClose={() => setSelectedClaim(null)}
        onAction={handleClaimAction}
      />

      <IntakeWizard
        visible={addClaimOpen}
        theme={theme}
        portals={intakePortals}
        config={intakeConfig}
        initialValues={{portalId}}
        onClose={() => setAddClaimOpen(false)}
        onSubmit={handleAddClaimSubmit}
      />
    </View>
  );
};

export default ClaimHistoryScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 38,
  },
  headerBlock: {
    paddingBottom: 4,
  },
  kpiWrap: {
    marginBottom: 14,
  },
  pageAction: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pageActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: 36,
    paddingHorizontal: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    overflow: 'visible',
  },
  fabSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -22,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E5EFF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  fabLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
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
    paddingBottom: 8,
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
