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
import {clearBusinessCache} from '../api/business';
import {clearSession, getEnteredPortal} from '../api/session';
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
  const entered = getEnteredPortal();
  const {user, portalId, portalName} = route.params;
  const businessName = entered?.businessName || portalName;
  const businessId = entered?.businessId || portalId;
  const theme = useMemo(() => getClaimPortalTheme('light'), []);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ClaimFilters>(defaultFilters());
  const [config, setConfig] = useState<ClaimHistoryConfig | null>(null);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addClaimOpen, setAddClaimOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavItem[]>(entered?.menu ?? []);
  const [portals, setPortals] = useState<ClaimPortal[]>([]);
  const [intakeConfig, setIntakeConfig] = useState<IntakeConfig | null>(null);
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

  const loadPage = useCallback(async () => {
    setIsListLoading(false);
    setHasMore(false);
    setListError('');
  }, []);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const portal = getEnteredPortal();
    if (portal?.menu.length) {
      setMenuItems(portal.menu);
    }
  }, []);

  const handleDrawerNavigate = useCallback(
    (destination: string) => {
      setDrawerOpen(false);
      if (destination === 'sign-out') {
        clearSession();
        clearBusinessCache();
        navigation.reset({
          index: 0,
          routes: [{name: 'PortalSelect'}],
        });
        return;
      }
      if (destination === 'claims') {
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
        navigation.navigate('ClaimPortals', {
          user,
          initialTab: destination === 'home' ? 'portals' : destination,
        });
        return;
      }
      showToast('This option will connect when the live API is ready.');
    },
    [navigation, showToast, user],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPage();
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
      showToast(`${label} submitted for ${businessName}. Live API comes next.`);
    },
    [businessName, showToast],
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
        businessId,
        meta: [],
        metrics: [],
      },
      ...portals,
    ];
  }, [businessId, portalId, portalName, portals]);

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
            onPress={() => loadPage()}
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
            {businessName} is open. Claims will show here when that API is connected.
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
            loadPage();
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
            {businessName}
          </Text>
          <Text
            style={[styles.headerSubtitle, {color: theme.textSecondary}]}
            numberOfLines={1}>
            {businessId ? `Business ID ${businessId}` : 'Entered business'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {renderBody()}

      {fabActions.length > 0 ? (
        <View
          style={[
            styles.fabWrap,
            {bottom: 20 + insets.bottom, right: 16},
          ]}>
          {fabActions.map(action => (
            <Pressable
              key={action.id}
              onPress={() => handlePageAction(action.destination)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={({pressed}) => [pressed && {opacity: 0.88}]}>
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
                <Text style={styles.fabLabel}>{action.label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      ) : null}

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
        portalName={businessName}
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

      {intakeConfig ? (
        <IntakeWizard
          visible={addClaimOpen}
          theme={theme}
          portals={intakePortals}
          config={intakeConfig}
          initialValues={{portalId}}
          onClose={() => setAddClaimOpen(false)}
          onSubmit={handleAddClaimSubmit}
        />
      ) : null}
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
    paddingBottom: 96,
    paddingHorizontal: 16,
  },
  fabWrap: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'flex-end',
    gap: 10,
  },
  fab: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1E5EFF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  fabLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
