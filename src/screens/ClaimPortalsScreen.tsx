import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fetchClaimPortalsDashboard} from '../api/claimPortals';
import {clearSession} from '../api/session';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {BottomTabBar, type MainTab} from '../components/claimPortals/BottomTabBar';
import {
  AddClaimSheet,
  BusinessRequestsSheet,
  FilterSheet,
  PortalActionsSheet,
  type AddClaimDraft,
  type PortalActionId,
} from '../components/claimPortals/ClaimPortalSheets';
import {PortalCard} from '../components/claimPortals/PortalCard';
import {PortalListControls} from '../components/claimPortals/PortalListControls';
import {
  SideDrawer,
  type DrawerDestination,
} from '../components/claimPortals/SideDrawer';
import {
  DashboardTabBody,
  HomeTabBody,
  ProfileTabBody,
} from '../components/claimPortals/TabPlaceholders';
import {
  getClaimPortalTheme,
  type ThemeScheme,
} from '../theme/claimPortals';
import type {
  ClaimPortal,
  ClaimPortalsDashboard,
  PortalFilters,
  PortalStatusFilter,
} from '../types/claimPortals';
import type {ClaimPortalsScreenProps} from '../types/navigation';

const DEFAULT_FILTERS: PortalFilters = {
  status: 'all',
  fromDate: '',
  toDate: '',
  sortBy: 'latest',
};

function applyPortalFilters(
  portals: ClaimPortal[],
  query: string,
  filters: PortalFilters,
): ClaimPortal[] {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = portals.filter(portal => {
    const matchesQuery =
      !normalizedQuery ||
      portal.name.toLowerCase().includes(normalizedQuery) ||
      portal.businessId.includes(normalizedQuery);

    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'new'
        ? portal.isNewThisMonth
        : portal.status === filters.status);

    const matchesFrom = !filters.fromDate || portal.createdAt >= filters.fromDate;
    const matchesTo = !filters.toDate || portal.createdAt <= filters.toDate;

    return matchesQuery && matchesStatus && matchesFrom && matchesTo;
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'oldest') {
      return left.createdAt.localeCompare(right.createdAt);
    }
    if (filters.sortBy === 'name-asc') {
      return left.name.localeCompare(right.name);
    }
    if (filters.sortBy === 'name-desc') {
      return right.name.localeCompare(left.name);
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}

function countActiveFilters(filters: PortalFilters): number {
  return [
    filters.status !== 'all',
    Boolean(filters.fromDate),
    Boolean(filters.toDate),
  ].filter(Boolean).length;
}

const ClaimPortalsScreen = ({navigation, route}: ClaimPortalsScreenProps) => {
  const insets = useSafeAreaInsets();
  const user = route.params.user;

  const [scheme, setScheme] = useState<ThemeScheme>('light');
  const [activeTab, setActiveTab] = useState<MainTab>('home');
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState('');

  const theme = useMemo(() => getClaimPortalTheme(scheme), [scheme]);

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
      setPortals(data.portals);
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

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const visiblePortals = useMemo(
    () => applyPortalFilters(portals, query, filters),
    [portals, query, filters],
  );

  const signOut = useCallback(() => {
    clearSession();
    navigation.reset({
      index: 0,
      routes: [{name: 'PortalSelect'}],
    });
  }, [navigation]);

  const openAddClaim = useCallback(() => {
    setAddClaimOpen(true);
  }, []);

  const openSearch = useCallback(() => {
    setActiveTab('portals');
    setSearchFocusToken(current => current + 1);
  }, []);

  const handleDrawerNavigate = useCallback(
    (destination: DrawerDestination) => {
      setDrawerOpen(false);
      if (destination === 'portals') {
        setActiveTab('portals');
        return;
      }
      if (destination === 'dashboard') {
        setActiveTab('dashboard');
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
      if (destination === 'profile') {
        setActiveTab('profile');
        return;
      }
      if (destination === 'sign-out') {
        signOut();
      }
    },
    [openAddClaim, openSearch, signOut],
  );

  const handleAddClaimSubmit = useCallback(
    (draft: AddClaimDraft) => {
      setAddClaimOpen(false);
      const portalName = portals.find(item => item.id === draft.portalId)?.name;
      showToast(
        portalName
          ? `${draft.title} saved for ${portalName}. Live submit comes next.`
          : `${draft.title} saved on this device. Live submit comes next.`,
      );
    },
    [portals, showToast],
  );

  const drawerDestination = useMemo<DrawerDestination | null>(() => {
    if (activeTab === 'portals') {
      return 'portals';
    }
    if (activeTab === 'dashboard') {
      return 'dashboard';
    }
    if (activeTab === 'profile') {
      return 'profile';
    }
    return null;
  }, [activeTab]);

  const handleStatusChange = (status: PortalStatusFilter) => {
    setFilters(current => ({...current, status}));
  };

  const handleSortPress = () => {
    const order: PortalFilters['sortBy'][] = [
      'latest',
      'oldest',
      'name-asc',
      'name-desc',
    ];
    setFilters(current => {
      const index = order.indexOf(current.sortBy);
      return {...current, sortBy: order[(index + 1) % order.length]};
    });
  };

  const handlePortalAction = (action: PortalActionId) => {
    const portal = selectedPortal;
    setSelectedPortal(null);
    if (!portal) {
      return;
    }

    if (action === 'view') {
      Alert.alert(
        portal.name,
        `Business ID: ${portal.businessId}\nStatus: ${portal.status}\nCreated: ${portal.createdAt}`,
      );
      return;
    }
    if (action === 'requests') {
      setRequestsOpen(true);
      return;
    }
    if (action === 'delete') {
      setPortals(current => current.filter(item => item.id !== portal.id));
      showToast(`${portal.name} removed from this device list.`);
      return;
    }
    showToast(
      action === 'edit'
        ? 'Edit Portal will connect to the live API later.'
        : 'Clone Portal will connect to the live API later.',
    );
  };

  const renderPortals = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.helper, {color: theme.textSecondary}]}>
            Loading claim portals...
          </Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.helper, {color: theme.danger}]}>
            {errorMessage}
          </Text>
          <Pressable
            onPress={() => loadDashboard()}
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
            onPress={() => setSelectedPortal(item)}
            onMenuPress={() => setSelectedPortal(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={[styles.pageTitle, {color: theme.text}]}>
              Claim Portals
            </Text>
            <Text style={[styles.pageSubtitle, {color: theme.textSecondary}]}>
              Manage and monitor all business portals
            </Text>
            {dashboard ? (
              <PortalListControls
                theme={theme}
                query={query}
                onQueryChange={setQuery}
                activeStatus={filters.status}
                onStatusChange={handleStatusChange}
                stats={dashboard.stats}
                filterCount={countActiveFilters(filters)}
                sortBy={filters.sortBy}
                onSortPress={handleSortPress}
                onFilterPress={() => setFilterOpen(true)}
                resultCount={visiblePortals.length}
                searchFocusToken={searchFocusToken}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, {color: theme.textSecondary}]}>
            No portals match your search or filters.
          </Text>
        }
        ListFooterComponent={
          <Text style={[styles.footer, {color: theme.textMuted}]}>
            © 2026 ARC Global Risk · Powered by WebAppClouds
          </Text>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={theme.primary}
          />
        }
      />
    );
  };

  return (
    <View style={[styles.root, {backgroundColor: theme.page}]}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <View style={{height: insets.top, backgroundColor: theme.page}} />
      <AppHeader
        theme={theme}
        userName={user.name}
        onMenuPress={() => setDrawerOpen(true)}
        onThemePress={() =>
          setScheme(current => (current === 'light' ? 'dark' : 'light'))
        }
        onProfilePress={() => setActiveTab('profile')}
      />

      <View style={styles.body}>
        {activeTab === 'portals' ? renderPortals() : null}
        {activeTab === 'home' ? (
          <HomeTabBody
            theme={theme}
            user={user}
            stats={dashboard?.stats ?? null}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            errorMessage={errorMessage}
            onRefresh={() => loadDashboard(true)}
            onRetry={() => loadDashboard()}
            onOpenPortals={() => setActiveTab('portals')}
            onBusinessRequestsPress={() => setRequestsOpen(true)}
          />
        ) : null}
        {activeTab === 'dashboard' ? (
          <DashboardTabBody
            theme={theme}
            stats={dashboard?.stats ?? null}
            summary={dashboard?.requestSummary ?? null}
            isRefreshing={isRefreshing}
            onRefresh={() => loadDashboard(true)}
            onOpenPortals={() => setActiveTab('portals')}
            onOpenRequests={() => setRequestsOpen(true)}
          />
        ) : null}
        {activeTab === 'profile' ? (
          <ProfileTabBody theme={theme} user={user} onSignOut={signOut} />
        ) : null}
      </View>

      <BottomTabBar
        theme={theme}
        activeTab={activeTab}
        bottomInset={insets.bottom}
        onChange={setActiveTab}
        onAddClaim={openAddClaim}
      />

      {toast ? (
        <View
          style={[
            styles.toast,
            {bottom: 88 + insets.bottom, backgroundColor: theme.text},
          ]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <SideDrawer
        visible={drawerOpen}
        theme={theme}
        user={user}
        activeDestination={drawerDestination}
        topInset={insets.top}
        bottomInset={insets.bottom}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleDrawerNavigate}
      />

      <FilterSheet
        visible={filterOpen}
        theme={theme}
        value={filters}
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
        onClose={() => setSelectedPortal(null)}
        onAction={handlePortalAction}
      />

      <BusinessRequestsSheet
        visible={requestsOpen}
        theme={theme}
        summary={
          dashboard?.requestSummary ?? {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
          }
        }
        onClose={() => setRequestsOpen(false)}
        onViewAll={() => {
          setRequestsOpen(false);
          setActiveTab('dashboard');
        }}
      />

      <AddClaimSheet
        visible={addClaimOpen}
        theme={theme}
        portals={portals}
        onClose={() => setAddClaimOpen(false)}
        onSubmit={handleAddClaimSubmit}
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
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  pageSubtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
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
