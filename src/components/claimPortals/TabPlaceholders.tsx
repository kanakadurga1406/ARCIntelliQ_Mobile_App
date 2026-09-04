import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {ClaimHandlerUser} from '../../types/auth';
import type {
  BusinessRequestSummary,
  PortalStats,
} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getInitials} from '../../theme/claimPortals';
import {KpiGrid} from './KpiGrid';

type HomeTabProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  stats: PortalStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string;
  onRefresh: () => void;
  onRetry: () => void;
  onOpenPortals: () => void;
  onBusinessRequestsPress: () => void;
};

export function HomeTabBody({
  theme,
  user,
  stats,
  isLoading,
  isRefreshing,
  errorMessage,
  onRefresh,
  onRetry,
  onOpenPortals,
  onBusinessRequestsPress,
}: HomeTabProps) {
  const firstName = user.name.split(' ')[0] || 'Handler';

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }>
      <Text style={[styles.kicker, {color: theme.primary}]}>Home</Text>
      <Text style={[styles.title, {color: theme.text}]}>
        Welcome, {firstName}
      </Text>
      <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
        A live snapshot of your claim workspace.
      </Text>

      {isLoading && !stats ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.helper, {color: theme.textSecondary}]}>
            Loading workspace stats...
          </Text>
        </View>
      ) : null}

      {errorMessage && !stats ? (
        <View style={styles.loadingBlock}>
          <Text style={[styles.helper, {color: theme.danger}]}>
            {errorMessage}
          </Text>
          <Pressable
            onPress={onRetry}
            style={[styles.button, {backgroundColor: theme.primary}]}>
            <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

      {stats ? (
        <View style={styles.kpiWrap}>
          <KpiGrid
            theme={theme}
            stats={stats}
            onBusinessRequestsPress={onBusinessRequestsPress}
          />
        </View>
      ) : null}

      <Pressable
        onPress={onOpenPortals}
        style={[styles.button, {backgroundColor: theme.primary}]}>
        <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
          Open Claim Portals
        </Text>
      </Pressable>
    </ScrollView>
  );
}

type DashboardTabProps = {
  theme: ClaimPortalTheme;
  stats: PortalStats | null;
  summary: BusinessRequestSummary | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenPortals: () => void;
  onOpenRequests: () => void;
};

export function DashboardTabBody({
  theme,
  stats,
  summary,
  isRefreshing,
  onRefresh,
  onOpenPortals,
  onOpenRequests,
}: DashboardTabProps) {
  const requestRows = [
    {label: 'Total requests', value: summary?.total},
    {label: 'Pending', value: summary?.pending},
    {label: 'Approved', value: summary?.approved},
    {label: 'Rejected', value: summary?.rejected},
  ];

  const portalRows = [
    {label: 'Total portals', value: stats?.total},
    {label: 'Active', value: stats?.active},
    {label: 'Inactive', value: stats?.inactive},
    {label: 'New this month', value: stats?.newThisMonth},
  ];

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }>
      <Text style={[styles.kicker, {color: theme.primary}]}>Dashboard</Text>
      <Text style={[styles.title, {color: theme.text}]}>Workspace overview</Text>
      <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
        Track request volume and portal health without leaving this screen.
      </Text>

      <View
        style={[
          styles.card,
          {backgroundColor: theme.card, borderColor: theme.border},
        ]}>
        <Text style={[styles.cardLabel, {color: theme.textMuted}]}>
          BUSINESS REQUESTS
        </Text>
        {requestRows.map(row => (
          <View key={row.label} style={styles.statRow}>
            <Text style={[styles.statLabel, {color: theme.textSecondary}]}>
              {row.label}
            </Text>
            <Text style={[styles.statValue, {color: theme.text}]}>
              {row.value ?? '—'}
            </Text>
          </View>
        ))}
        <Pressable
          onPress={onOpenRequests}
          style={[styles.linkButton, {borderColor: theme.border}]}>
          <Text style={[styles.linkText, {color: theme.primary}]}>
            View request details
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          {backgroundColor: theme.card, borderColor: theme.border},
        ]}>
        <Text style={[styles.cardLabel, {color: theme.textMuted}]}>
          PORTAL HEALTH
        </Text>
        {portalRows.map(row => (
          <View key={row.label} style={styles.statRow}>
            <Text style={[styles.statLabel, {color: theme.textSecondary}]}>
              {row.label}
            </Text>
            <Text style={[styles.statValue, {color: theme.text}]}>
              {row.value ?? '—'}
            </Text>
          </View>
        ))}
        <Pressable
          onPress={onOpenPortals}
          style={[styles.button, {backgroundColor: theme.primary, marginTop: 8}]}>
          <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
            Manage Claim Portals
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

type ProfileTabProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  onSignOut: () => void;
};

export function ProfileTabBody({theme, user, onSignOut}: ProfileTabProps) {
  return (
    <View style={styles.page}>
      <Text style={[styles.kicker, {color: theme.primary}]}>Profile</Text>
      <View
        style={[
          styles.card,
          styles.profileCard,
          {backgroundColor: theme.card, borderColor: theme.border},
        ]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>
        <Text style={[styles.title, {color: theme.text, textAlign: 'center'}]}>
          {user.name}
        </Text>
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          {user.title}
        </Text>
        <Text style={[styles.email, {color: theme.textMuted}]}>{user.email}</Text>
        <Pressable
          onPress={onSignOut}
          style={[styles.button, {backgroundColor: theme.primary, marginTop: 20}]}>
          <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  kpiWrap: {
    marginTop: 20,
  },
  loadingBlock: {
    marginTop: 28,
    alignItems: 'center',
  },
  helper: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 8,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10233F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    marginTop: 4,
    fontSize: 13,
  },
});
