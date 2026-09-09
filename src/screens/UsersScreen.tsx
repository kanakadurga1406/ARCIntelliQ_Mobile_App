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
import {fetchClaimPortalsDashboard} from '../api/business';
import {clearSession} from '../api/session';
import {
  createBusinessFromExisting,
  deleteUser,
  fetchUsersPage,
  saveUser,
  USER_PAGE_SIZE,
} from '../api/users';
import {AppDialog, useAppDialog} from '../components/claimPortals/AppDialog';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {PageBackdrop} from '../components/claimPortals/PageBackdrop';
import {PageHero} from '../components/claimPortals/PageHero';
import {PortalListControls} from '../components/claimPortals/PortalListControls';
import {SideDrawer} from '../components/claimPortals/SideDrawer';
import {UiIcon} from '../components/claimPortals/UiIcon';
import {CreateBusinessSheet} from '../components/users/CreateBusinessSheet';
import {UserAccessSheet} from '../components/users/UserAccessSheet';
import {UserActionsSheet} from '../components/users/UserActionsSheet';
import {UserCard} from '../components/users/UserCard';
import {UserDetailSheet} from '../components/users/UserDetailSheet';
import {UserFilterSheet} from '../components/users/UserFilterSheet';
import {getClaimPortalTheme} from '../theme/claimPortals';
import type {NavItem} from '../types/claimPortals';
import type {
  AppUser,
  UserFilters,
  UsersPageConfig,
} from '../types/users';
import type {UsersScreenProps} from '../types/navigation';
import {portalMenuItems} from '../utils/hubMenu';
import {formFromUser, mergeUniqueUsers} from '../utils/userList';

const DEFAULT_FILTERS: UserFilters = {
  status: 'all',
  businessId: 'all',
  userType: 'all',
  sortBy: 'latest',
};

function countActiveFilters(filters: UserFilters): number {
  return [
    filters.status !== 'all',
    filters.businessId !== 'all',
    filters.userType !== 'all',
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

const UsersScreen = ({navigation, route}: UsersScreenProps) => {
  const insets = useSafeAreaInsets();
  const {user, portalId, portalName} = route.params;
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const {dialog, showDialog, hideDialog} = useAppDialog();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);
  const [config, setConfig] = useState<UsersPageConfig | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState('');
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createBusinessOpen, setCreateBusinessOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavItem[]>(() =>
    portalMenuItems([]),
  );
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [detailUser, setDetailUser] = useState<AppUser | null>(null);
  const [accessUser, setAccessUser] = useState<AppUser | null>(null);
  const [directoryUsers, setDirectoryUsers] = useState<AppUser[]>([]);
  const [toast, setToast] = useState('');

  const debouncedQuery = useDebouncedValue(query, 320);
  const requestSeqRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const usersRef = useRef<AppUser[]>([]);

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
        if (usersRef.current.length === 0) {
          setIsListLoading(true);
        }
      }

      const requestId = requestSeqRef.current;
      setListError('');

      try {
        const result = await fetchUsersPage({
          page: nextPage,
          limit: USER_PAGE_SIZE,
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
        setUsers(current => {
          const next =
            mode === 'replace'
              ? result.list.items
              : mergeUniqueUsers(current, result.list.items);
          usersRef.current = next;
          return next;
        });
      } catch (error) {
        if (requestId !== requestSeqRef.current) {
          return;
        }
        const message =
          error instanceof Error ? error.message : 'Unable to load users.';
        if (mode === 'replace' && usersRef.current.length === 0) {
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
    loadPage(1, 'replace');
  }, [loadPage]);

  useEffect(() => {
    const savedUserName = route.params.savedUserName;
    const savedUserAction = route.params.savedUserAction;
    if (!savedUserName || !savedUserAction) {
      return;
    }
    const toastMessage =
      savedUserAction === 'created'
        ? `${savedUserName} was added.`
        : savedUserAction === 'updated'
          ? `${savedUserName} was updated.`
          : `${savedUserName}'s password was updated.`;
    showToast(toastMessage);
    loadPage(1, 'replace');
    navigation.setParams({
      savedUserName: undefined,
      savedUserAction: undefined,
    });
  }, [
    loadPage,
    navigation,
    route.params.savedUserAction,
    route.params.savedUserName,
    showToast,
  ]);

  useEffect(() => {
    let cancelled = false;
    fetchClaimPortalsDashboard()
      .then(data => {
        if (!cancelled) {
          setMenuItems(portalMenuItems(data.menuItems));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMenuItems(portalMenuItems([]));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadPage(1, 'replace');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPage]);

  const signOut = useCallback(() => {
    clearSession();
    navigation.reset({
      index: 0,
      routes: [{name: 'PortalSelect'}],
    });
  }, [navigation]);

  const handleDrawerNavigate = useCallback(
    (destination: string) => {
      setDrawerOpen(false);
      if (destination === 'users') {
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
      if (destination === 'add-claim' && portalId && portalName) {
        navigation.navigate('ClaimHistory', {user, portalId, portalName});
        return;
      }
      if (
        destination === 'home' ||
        destination === 'portals' ||
        destination === 'dashboard' ||
        destination === 'profile' ||
        destination === 'add-claim'
      ) {
        navigation.navigate('ClaimPortals', {
          user,
          initialTab:
            destination === 'add-claim' || destination === 'home'
              ? 'portals'
              : destination,
          openAddClaim: destination === 'add-claim',
        });
        return;
      }
      showToast('This option will connect when the live API is ready.');
    },
    [navigation, portalId, portalName, showToast, signOut, user],
  );

  const openCreate = useCallback(() => {
    navigation.navigate('UserSetup', {user, portalId, portalName});
  }, [navigation, portalId, portalName, user]);

  const openEdit = useCallback(
    (target: AppUser) => {
      setSelectedUser(null);
      setDetailUser(null);
      navigation.navigate('UserSetup', {
        user,
        portalId,
        portalName,
        editingUser: target,
      });
    },
    [navigation, portalId, portalName, user],
  );

  const openAccess = useCallback((target: AppUser) => {
    setSelectedUser(null);
    setDetailUser(null);
    setAccessUser(target);
    setAccessOpen(true);
  }, []);

  const openReset = useCallback(
    (target: AppUser) => {
      setSelectedUser(null);
      setDetailUser(null);
      navigation.navigate('UserResetPassword', {
        user,
        portalId,
        portalName,
        targetUser: target,
      });
    },
    [navigation, portalId, portalName, user],
  );

  const requestDelete = useCallback(
    (target: AppUser) => {
      setSelectedUser(null);
      setDetailUser(null);
      showDialog({
        title: 'Delete user',
        message: `Remove ${target.name} from this workspace? This cannot be undone on this device.`,
        buttons: [
          {label: 'Cancel'},
          {
            label: 'Delete',
            tone: 'destructive',
            onPress: () => {
              deleteUser(target.id)
                .then(() => {
                  setUsers(current => {
                    const next = current.filter(item => item.id !== target.id);
                    usersRef.current = next;
                    return next;
                  });
                  setListTotal(current => Math.max(0, current - 1));
                  showToast(`${target.name} was removed.`);
                })
                .catch(error => {
                  showToast(
                    error instanceof Error
                      ? error.message
                      : 'Unable to delete this user.',
                  );
                });
            },
          },
        ],
      });
    },
    [showDialog, showToast],
  );

  const handleCreateBusiness = useCallback(
    async (userId: string, businessName: string) => {
      setSaving(true);
      try {
        const created = await createBusinessFromExisting({
          userId,
          businessName,
        });
        setCreateBusinessOpen(false);
        setUsers(current => {
          const next = [created, ...current.filter(item => item.id !== created.id)];
          usersRef.current = next;
          return next;
        });
        setListTotal(current => current + 1);
        showToast(`${businessName} was created from an existing user.`);
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : 'Unable to create this business.',
        );
      } finally {
        setSaving(false);
      }
    },
    [showToast],
  );

  const handleSaveAccess = useCallback(
    async (nextPortalId: string) => {
      if (!accessUser) {
        return;
      }
      setSaving(true);
      try {
        const saved = await saveUser(
          {
            ...formFromUser(accessUser),
            assignments: [
              {
                id: accessUser.assignments?.[0]?.id ?? `asg-${accessUser.id}`,
                portalId: nextPortalId,
                role: accessUser.role,
              },
            ],
          },
          accessUser.id,
        );
        setAccessOpen(false);
        setAccessUser(null);
        setUsers(current => {
          const next = current.map(item => (item.id === saved.id ? saved : item));
          usersRef.current = next;
          return next;
        });
        showToast(`Portal access updated for ${saved.name}.`);
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : 'Unable to update portal access.',
        );
      } finally {
        setSaving(false);
      }
    },
    [accessUser, showToast],
  );

  const handleSortPress = () => {
    const order = config?.sortOptions ?? [];
    if (order.length === 0) {
      return;
    }
    setFilters(current => {
      const index = order.findIndex(item => item.id === current.sortBy);
      return {...current, sortBy: order[(index + 1) % order.length].id};
    });
  };

  const renderBody = () => {
    if (isListLoading && users.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.helper, {color: theme.textSecondary}]}>
            Loading users...
          </Text>
        </View>
      );
    }

    if (listError && users.length === 0) {
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
        data={users}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({item}) => (
          <UserCard
            theme={theme}
            user={item}
            onPress={() => setDetailUser(item)}
            onMenuPress={() => setSelectedUser(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <PageHero
              icon="users"
              title={config?.title || 'Users'}
              subtitle={
                config?.subtitle || 'Manage users, roles, and portal access.'
              }
            />
            <Pressable
              onPress={async () => {
                setCreateBusinessOpen(true);
                try {
                  const result = await fetchUsersPage({
                    page: 1,
                    limit: 100,
                    search: '',
                    filters: DEFAULT_FILTERS,
                  });
                  setDirectoryUsers(result.list.items);
                } catch {
                  setDirectoryUsers(users);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Create business from existing"
              style={({pressed}) => [
                styles.secondaryAction,
                {
                  borderColor: theme.primary,
                  backgroundColor: theme.card,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}>
              <UiIcon name="briefcase" color={theme.primary} size={15} />
              <Text style={[styles.secondaryActionText, {color: theme.primary}]}>
                Create business from existing
              </Text>
            </Pressable>
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
                onSortPress={handleSortPress}
                onFilterPress={() => setFilterOpen(true)}
                resultCount={listTotal}
                loadedCount={users.length}
                searchPlaceholder="Search users..."
                countNoun="users"
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isListLoading ? undefined : (
            <Text style={[styles.empty, {color: theme.textSecondary}]}>
              No users match your search or filters.
            </Text>
          )
        }
        ListFooterComponent={
          <View style={styles.listFooter}>
            {isLoadingMore ? (
              <View style={styles.moreRow}>
                <ActivityIndicator color={theme.primary} />
                <Text style={[styles.moreText, {color: theme.textSecondary}]}>
                  Loading more users...
                </Text>
              </View>
            ) : null}
            {!hasMore && users.length > 0 ? (
              <Text style={[styles.endText, {color: theme.textMuted}]}>
                All {listTotal} users loaded
              </Text>
            ) : null}
            <Text style={[styles.footer, {color: theme.textMuted}]}>
              © 2026 ARC Global Risk · Powered by WebAppClouds
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: 108 + insets.bottom},
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!isListLoading && !isRefreshing) {
            loadPage(page + 1, 'append');
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
            onRefresh={refresh}
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
        onProfilePress={() =>
          navigation.navigate('ClaimPortals', {user, initialTab: 'profile'})
        }
      />

      <View style={styles.body}>{renderBody()}</View>

      <View style={[styles.fabWrap, {bottom: 20 + insets.bottom}]}>
        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          accessibilityLabel="Add new user"
          style={({pressed}) => [pressed && {opacity: 0.88}]}>
          <LinearGradient
            colors={['#3C8CFF', '#1E5EFF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.fab}>
            <UiIcon name="plus" color="#FFFFFF" size={18} />
            <Text style={styles.fabLabel}>Add new user</Text>
          </LinearGradient>
        </Pressable>
      </View>

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
        portalName={portalName}
        menuItems={menuItems}
        activeDestination="users"
        topInset={insets.top}
        bottomInset={insets.bottom}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleDrawerNavigate}
      />

      <UserFilterSheet
        visible={filterOpen}
        theme={theme}
        value={filters}
        businesses={config?.businesses ?? []}
        userTypes={config?.userTypes ?? []}
        statusChips={config?.statusChips ?? []}
        sortOptions={config?.sortOptions ?? []}
        onClose={() => setFilterOpen(false)}
        onApply={next => {
          setFilters(next);
          setFilterOpen(false);
        }}
      />

      <UserActionsSheet
        visible={Boolean(selectedUser)}
        theme={theme}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onAction={action => {
          const target = selectedUser;
          if (!target) {
            return;
          }
          if (action === 'edit') {
            openEdit(target);
            return;
          }
          if (action === 'access') {
            openAccess(target);
            return;
          }
          if (action === 'reset') {
            openReset(target);
            return;
          }
          requestDelete(target);
        }}
      />

      <UserDetailSheet
        visible={Boolean(detailUser)}
        theme={theme}
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={() => detailUser && openEdit(detailUser)}
        onAccess={() => detailUser && openAccess(detailUser)}
        onReset={() => detailUser && openReset(detailUser)}
        onDelete={() => detailUser && requestDelete(detailUser)}
      />

      <CreateBusinessSheet
        visible={createBusinessOpen}
        theme={theme}
        users={directoryUsers.length > 0 ? directoryUsers : users}
        saving={saving}
        onClose={() => setCreateBusinessOpen(false)}
        onSubmit={handleCreateBusiness}
      />

      <UserAccessSheet
        visible={accessOpen}
        theme={theme}
        user={accessUser}
        businesses={config?.businesses ?? []}
        onClose={() => {
          setAccessOpen(false);
          setAccessUser(null);
        }}
        onSave={handleSaveAccess}
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

export default UsersScreen;

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
  secondaryAction: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: {
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
  fabWrap: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    alignItems: 'flex-end',
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
