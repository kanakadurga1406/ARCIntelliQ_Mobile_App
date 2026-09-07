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
  ClaimPortalsDashboard,
  PageAction,
  ProfileField,
  StatCard,
} from '../../types/claimPortals';
import type {ProfilePage} from '../../types/profile';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {KpiGrid} from './KpiGrid';
import {ProfileSettings} from './ProfileSettings';

type HomeTabProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  subtitle: string;
  actions: PageAction[];
  statCards: StatCard[] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string;
  onRefresh: () => void;
  onRetry: () => void;
  onAction: (destination: string) => void;
  onStatPress: (card: StatCard) => void;
};

export function HomeTabBody({
  theme,
  user,
  subtitle,
  actions,
  statCards,
  isLoading,
  isRefreshing,
  errorMessage,
  onRefresh,
  onRetry,
  onAction,
  onStatPress,
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
      <Text style={[styles.title, {color: theme.text}]}>
        Welcome, {firstName}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          {subtitle}
        </Text>
      ) : null}

      {isLoading && !statCards ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={theme.primary} />
          <Text style={[styles.helper, {color: theme.textSecondary}]}>
            Loading workspace stats...
          </Text>
        </View>
      ) : null}

      {errorMessage && !statCards ? (
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

      {statCards ? (
        <View style={styles.kpiWrap}>
          <KpiGrid theme={theme} cards={statCards} onCardPress={onStatPress} />
        </View>
      ) : null}

      {actions.map(action => (
        <Pressable
          key={action.id}
          onPress={() => onAction(action.destination)}
          style={[styles.button, {backgroundColor: theme.primary}]}>
          <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

type DashboardTabProps = {
  theme: ClaimPortalTheme;
  dashboard: ClaimPortalsDashboard['dashboard'] | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onAction: (destination: string) => void;
};

export function DashboardTabBody({
  theme,
  dashboard,
  isRefreshing,
  onRefresh,
  onAction,
}: DashboardTabProps) {
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
      <Text style={[styles.title, {color: theme.text}]}>
        {dashboard?.title || 'Workspace overview'}
      </Text>
      {dashboard?.subtitle ? (
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          {dashboard.subtitle}
        </Text>
      ) : null}

      {(dashboard?.sections ?? []).map(section => (
        <View
          key={section.id}
          style={[
            styles.card,
            {backgroundColor: theme.card, borderColor: theme.border},
          ]}>
          <Text style={[styles.cardLabel, {color: theme.textMuted}]}>
            {section.title}
          </Text>
          {section.rows.map(row => (
            <View key={row.id} style={styles.statRow}>
              <Text style={[styles.statLabel, {color: theme.textSecondary}]}>
                {row.label}
              </Text>
              <Text style={[styles.statValue, {color: theme.text}]}>
                {row.value}
              </Text>
            </View>
          ))}
          {section.action ? (
            <Pressable
              onPress={() => onAction(section.action!.destination)}
              style={[
                styles.button,
                {backgroundColor: theme.primary, marginTop: 8},
              ]}>
              <Text style={[styles.buttonText, {color: theme.onPrimary}]}>
                {section.action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

type ProfileTabProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  page: ProfilePage;
  extraFields: ProfileField[];
  onToggleTheme: () => void;
  onSignOut: () => void;
};

export function ProfileTabBody({
  theme,
  user,
  page,
  extraFields,
  onToggleTheme,
  onSignOut,
}: ProfileTabProps) {
  return (
    <ProfileSettings
      theme={theme}
      user={user}
      page={page}
      extraFields={extraFields}
      onToggleTheme={onToggleTheme}
      onSignOut={onSignOut}
    />
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
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
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
});
