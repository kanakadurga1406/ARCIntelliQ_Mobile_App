import React, {useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type {ClaimHandlerUser, UserRole} from '../../types/auth';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getAvatarColor, getInitials} from '../../theme/claimPortals';
import {
  BellMiniIcon,
  BuildingIcon,
  ChevronRightIcon,
  GlobeMiniIcon,
  LogoutMiniIcon,
  MailMiniIcon,
  MoonIcon,
  PencilMiniIcon,
  ShieldMiniIcon,
  SunIcon,
} from './ClaimPortalsIcons';

const APP_VERSION = '0.0.1';
const ORGANIZATION = 'ARC Global Risk';
const WORKSPACE = 'ARCintelliQ Claim Portals';

type ProfileSettingsProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  onToggleTheme: () => void;
  onSignOut: () => void;
};

function formatRole(role: UserRole): string {
  if (role === 'claim-handler') {
    return 'Claim Handler';
  }
  if (role === 'claimant') {
    return 'Claimant';
  }
  return 'Contractor';
}

export function ProfileSettings({
  theme,
  user,
  onToggleTheme,
  onSignOut,
}: ProfileSettingsProps) {
  const [notifyClaims, setNotifyClaims] = useState(true);
  const isDark = theme.scheme === 'dark';
  const roleLabel = formatRole(user.role);

  const shareEmail = async () => {
    try {
      await Share.share({
        title: 'Handler email',
        message: user.email,
      });
    } catch {
      Alert.alert('Email', user.email);
    }
  };

  const comingSoon = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.page}>
      <View
        style={[
          styles.identity,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        <View style={[styles.avatar, {backgroundColor: getAvatarColor(user.name)}]}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={[styles.name, {color: theme.text}]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text
            style={[styles.title, {color: theme.textSecondary}]}
            numberOfLines={1}>
            {user.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.statusDot, {backgroundColor: theme.success}]} />
            <Text style={[styles.meta, {color: theme.textMuted}]}>
              Active · {roleLabel}
            </Text>
          </View>
        </View>
      </View>

      <SectionLabel theme={theme} label="Account" />
      <Group theme={theme}>
        <SettingsRow
          theme={theme}
          icon={<MailMiniIcon color={theme.primary} size={15} />}
          iconBg={isDark ? theme.cardMuted : '#E8F1FF'}
          label="Email"
          value={user.email}
          onPress={shareEmail}
        />
        <SettingsRow
          theme={theme}
          icon={<ShieldMiniIcon color={theme.purple} size={15} />}
          iconBg={theme.purpleSoft}
          label="Handler ID"
          value={user.id.toUpperCase()}
        />
        <SettingsRow
          theme={theme}
          icon={<BuildingIcon color={theme.orange} size={15} />}
          iconBg={theme.warningSoft}
          label="Organization"
          value={ORGANIZATION}
        />
        <SettingsRow
          theme={theme}
          icon={<GlobeMiniIcon color={theme.success} size={15} />}
          iconBg={theme.successSoft}
          label="Workspace"
          value={WORKSPACE}
          last
        />
      </Group>

      <SectionLabel theme={theme} label="Preferences" />
      <Group theme={theme}>
        <SettingsRow
          theme={theme}
          icon={
            isDark ? (
              <MoonIcon color={theme.primary} size={15} cutColor={theme.cardMuted} />
            ) : (
              <SunIcon color={theme.gold} size={15} />
            )
          }
          iconBg={isDark ? theme.cardMuted : theme.goldSoft}
          label="Appearance"
          value={isDark ? 'Dark' : 'Light'}
          onPress={onToggleTheme}
        />
        <View
          style={[
            styles.row,
            styles.rowLast,
            {borderBottomColor: theme.border},
          ]}>
          <View style={[styles.iconWrap, {backgroundColor: theme.successSoft}]}>
            <BellMiniIcon color={theme.success} size={15} />
          </View>
          <View style={styles.rowCopy}>
            <Text style={[styles.rowLabel, {color: theme.text}]}>
              Claim alerts
            </Text>
            <Text style={[styles.rowHint, {color: theme.textMuted}]}>
              New assignments and portal updates
            </Text>
          </View>
          <Switch
            value={notifyClaims}
            onValueChange={setNotifyClaims}
            thumbColor="#FFFFFF"
            trackColor={{false: theme.border, true: theme.primary}}
            accessibilityLabel="Claim alerts"
          />
        </View>
      </Group>

      <SectionLabel theme={theme} label="Security" />
      <Group theme={theme}>
        <SettingsRow
          theme={theme}
          icon={<PencilMiniIcon color={theme.text} size={15} />}
          iconBg={theme.chip}
          label="Change password"
          value="Managed by your admin"
          onPress={() =>
            comingSoon(
              'Change password',
              'Password updates will connect to the live identity service later.',
            )
          }
        />
        <SettingsRow
          theme={theme}
          icon={<ShieldMiniIcon color={theme.primary} size={15} />}
          iconBg={isDark ? theme.cardMuted : '#E8F1FF'}
          label="Signed in"
          value="This device"
          last
        />
      </Group>

      <SectionLabel theme={theme} label="Support" />
      <Group theme={theme}>
        <SettingsRow
          theme={theme}
          icon={<MailMiniIcon color={theme.primary} size={15} />}
          iconBg={isDark ? theme.cardMuted : '#E8F1FF'}
          label="Help & support"
          onPress={() =>
            comingSoon(
              'Help & support',
              'Contact your ARC Global Risk administrator or email support@arcintelliq.com.',
            )
          }
        />
        <SettingsRow
          theme={theme}
          icon={<GlobeMiniIcon color={theme.textSecondary} size={15} />}
          iconBg={theme.chip}
          label="Privacy & terms"
          onPress={() =>
            comingSoon(
              'Privacy & terms',
              'Legal documents will open from the live portal when they are connected.',
            )
          }
        />
        <SettingsRow
          theme={theme}
          icon={<BuildingIcon color={theme.textSecondary} size={15} />}
          iconBg={theme.chip}
          label="App version"
          value={APP_VERSION}
          last
        />
      </Group>

      <Pressable
        onPress={onSignOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={({pressed}) => [
          styles.signOut,
          {backgroundColor: theme.dangerSoft, borderColor: theme.border},
          pressed && {opacity: 0.86},
        ]}>
        <LogoutMiniIcon color={theme.danger} size={16} />
        <Text style={[styles.signOutText, {color: theme.danger}]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionLabel({
  theme,
  label,
}: {
  theme: ClaimPortalTheme;
  label: string;
}) {
  return (
    <Text style={[styles.section, {color: theme.textMuted}]}>{label}</Text>
  );
}

function Group({
  theme,
  children,
}: {
  theme: ClaimPortalTheme;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.group,
        {backgroundColor: theme.card, borderColor: theme.border},
      ]}>
      {children}
    </View>
  );
}

function SettingsRow({
  theme,
  icon,
  iconBg,
  label,
  value,
  last,
  onPress,
}: {
  theme: ClaimPortalTheme;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={[styles.iconWrap, {backgroundColor: iconBg}]}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, {color: theme.text}]}>{label}</Text>
        {value ? (
          <Text style={[styles.rowValue, {color: theme.textSecondary}]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {onPress ? <ChevronRightIcon color={theme.textMuted} size={8} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({pressed}) => [
          styles.row,
          last && styles.rowLast,
          {borderBottomColor: theme.border},
          pressed && {backgroundColor: theme.cardMuted},
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.row,
        last && styles.rowLast,
        {borderBottomColor: theme.border},
      ]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  identityCopy: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  group: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  rowHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  signOut: {
    marginTop: 24,
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
    fontWeight: '800',
  },
});
