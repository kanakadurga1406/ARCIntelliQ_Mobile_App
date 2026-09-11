import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {ClaimHandlerUser} from '../../types/auth';
import type {ProfileField} from '../../types/claimPortals';
import type {ProfilePage} from '../../types/profile';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getAvatarColor, getInitials} from '../../theme/claimPortals';
import {shadows} from '../../theme/visual';
import {LogoutMiniIcon} from './ClaimPortalsIcons';
import {LoginStyleBackButton} from './LoginStyleBackButton';
import {UiIcon} from './UiIcon';

type ProfileSettingsProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  page: ProfilePage;
  extraFields?: ProfileField[];
  portalName?: string;
  onSignOut: () => void;
  onBack?: () => void;
};

function sameLabel(left: string, right: string): boolean {
  return (
    left.replace(/\s+/g, '').toLowerCase() ===
    right.replace(/\s+/g, '').toLowerCase()
  );
}

export function ProfileSettings({
  theme,
  user,
  portalName,
  onSignOut,
  onBack,
}: ProfileSettingsProps) {
  const displayName = user.name.trim() || user.title.trim() || 'Account';
  const roleLabel = user.title.trim();
  const showRole = Boolean(roleLabel && !sameLabel(displayName, roleLabel));
  const enteredPortalName = portalName?.trim() || '';
  const showPortal = Boolean(enteredPortalName);

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.page}>
      {onBack ? (
        <View style={styles.navRow}>
          <LoginStyleBackButton onPress={onBack} label="Back" />
        </View>
      ) : null}

      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        <LinearGradient
          colors={['rgba(43,116,255,0.12)', 'rgba(43,116,255,0)']}
          start={{x: 0.5, y: 0}}
          end={{x: 0.5, y: 1}}
          style={styles.heroGlow}
        />
        <View
          style={[
            styles.avatarRing,
            {borderColor: `${getAvatarColor(displayName)}33`},
          ]}>
          <View
            style={[
              styles.avatar,
              {backgroundColor: getAvatarColor(displayName)},
            ]}>
            <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
          </View>
        </View>
        <Text style={[styles.name, {color: theme.text}]}>{displayName}</Text>
        {showRole ? (
          <View
            style={[
              styles.roleChip,
              {backgroundColor: theme.chip, borderColor: theme.border},
            ]}>
            <Text style={[styles.roleChipText, {color: theme.primary}]}>
              {roleLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.section, {color: theme.textMuted}]}>Account</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        {showPortal ? (
          <>
            <AccountRow
              theme={theme}
              icon="building"
              label="Portal"
              value={enteredPortalName}
            />
            <View style={[styles.divider, {backgroundColor: theme.border}]} />
          </>
        ) : null}
        <AccountRow
          theme={theme}
          icon="mail"
          label="Email"
          value={user.email || '—'}
          last
        />
      </View>

      <Pressable
        onPress={onSignOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={({pressed}) => [
          styles.signOut,
          {
            backgroundColor: theme.dangerSoft,
            borderColor: theme.dangerSoft,
          },
          pressed && {opacity: 0.86},
        ]}>
        <LogoutMiniIcon color={theme.danger} size={16} />
        <Text style={[styles.signOutText, {color: theme.danger}]}>
          Sign out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function AccountRow({
  theme,
  icon,
  label,
  value,
  muted,
  last,
}: {
  theme: ClaimPortalTheme;
  icon: string;
  label: string;
  value: string;
  muted?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.accountRow, last && styles.accountRowLast]}>
      <View style={[styles.iconWrap, {backgroundColor: theme.chip}]}>
        <UiIcon name={icon} color={theme.primary} size={16} />
      </View>
      <View style={styles.accountCopy}>
        <Text style={[styles.accountLabel, {color: theme.textMuted}]}>
          {label}
        </Text>
        <Text
          style={[
            styles.accountValue,
            {color: muted ? theme.textMuted : theme.text},
          ]}>
          {value}
        </Text>
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
    paddingBottom: 40,
  },
  navRow: {
    marginBottom: 12,
  },
  hero: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    overflow: 'hidden',
    ...shadows.card,
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  name: {
    marginTop: 16,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  roleChip: {
    marginTop: 10,
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.card,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  accountRowLast: {
    paddingBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },
  accountLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  signOut: {
    marginTop: 28,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
