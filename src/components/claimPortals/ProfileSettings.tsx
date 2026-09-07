import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {ClaimHandlerUser, UserRole} from '../../types/auth';
import type {ProfileField} from '../../types/claimPortals';
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

const BUILTIN_FIELD_IDS = new Set([
  'handler-id',
  'email',
  'name',
  'organization',
  'workspace',
]);

type ProfileSettingsProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  extraFields?: ProfileField[];
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
  extraFields = [],
  onToggleTheme,
  onSignOut,
}: ProfileSettingsProps) {
  const [notifyClaims, setNotifyClaims] = useState(true);
  const isDark = theme.scheme === 'dark';
  const roleLabel = formatRole(user.role);
  const handlerId =
    extraFields.find(field => field.id === 'handler-id')?.value ??
    user.id.toUpperCase();
  const assignmentFields = useMemo(
    () => extraFields.filter(field => !BUILTIN_FIELD_IDS.has(field.id)),
    [extraFields],
  );

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
      <View style={styles.identity}>
        <View
          style={[
            styles.avatarRing,
            {borderColor: isDark ? theme.border : '#D7E4F7'},
          ]}>
          <View
            style={[
              styles.avatar,
              {backgroundColor: getAvatarColor(user.name)},
            ]}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
        </View>
        <Text style={[styles.name, {color: theme.text}]} numberOfLines={1}>
          {user.name}
        </Text>
        <Text
          style={[styles.jobTitle, {color: theme.textSecondary}]}
          numberOfLines={2}>
          {user.title}
        </Text>
        <View style={styles.pills}>
          <View
            style={[
              styles.pill,
              {backgroundColor: theme.successSoft, borderColor: theme.border},
            ]}>
            <View style={[styles.statusDot, {backgroundColor: theme.success}]} />
            <Text style={[styles.pillText, {color: theme.success}]}>Active</Text>
          </View>
          <View
            style={[
              styles.pill,
              {
                backgroundColor: isDark ? theme.cardMuted : '#E8F1FF',
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.pillText, {color: theme.primary}]}>
              {roleLabel}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() =>
            comingSoon(
              'Edit profile',
              'Name, title, and contact details will be editable when the identity service is connected.',
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          style={({pressed}) => [
            styles.editButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && {opacity: 0.82},
          ]}>
          <PencilMiniIcon color={theme.text} size={13} />
          <Text style={[styles.editText, {color: theme.text}]}>
            Edit profile
          </Text>
        </Pressable>
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
          value={handlerId}
        />
        {assignmentFields.map(field => (
          <SettingsRow
            key={field.id}
            theme={theme}
            icon={<GlobeMiniIcon color={theme.success} size={15} />}
            iconBg={theme.successSoft}
            label={field.label || 'Detail'}
            value={field.value}
          />
        ))}
        <SettingsRow
          theme={theme}
          icon={<BuildingIcon color={theme.orange} size={15} />}
          iconBg={theme.warningSoft}
          label="Organization"
          value={ORGANIZATION}
        />
        <SettingsRow
          theme={theme}
          icon={<GlobeMiniIcon color={theme.primary} size={15} />}
          iconBg={isDark ? theme.cardMuted : '#E8F1FF'}
          label="Workspace"
          value={WORKSPACE}
          last
        />
      </Group>

      <SectionLabel theme={theme} label="Preferences" />
      <Group theme={theme}>
        <SwitchRow
          theme={theme}
          icon={
            isDark ? (
              <MoonIcon
                color={theme.primary}
                size={15}
                cutColor={theme.cardMuted}
              />
            ) : (
              <SunIcon color={theme.gold} size={15} />
            )
          }
          iconBg={isDark ? theme.cardMuted : theme.goldSoft}
          label="Dark mode"
          hint={isDark ? 'On · easier on the eyes' : 'Off · light workspace'}
          value={isDark}
          onValueChange={onToggleTheme}
        />
        <SwitchRow
          theme={theme}
          icon={<BellMiniIcon color={theme.success} size={15} />}
          iconBg={theme.successSoft}
          label="Claim alerts"
          hint="New assignments and portal updates"
          value={notifyClaims}
          onValueChange={setNotifyClaims}
          last
        />
      </Group>

      <SectionLabel theme={theme} label="Security" />
      <Group theme={theme}>
        <SettingsRow
          theme={theme}
          icon={<PencilMiniIcon color={theme.text} size={15} />}
          iconBg={theme.chip}
          label="Change password"
          value="Admin managed"
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
          label="About"
          value={`Version ${APP_VERSION}`}
          last
        />
      </Group>

      <Group theme={theme} style={styles.signOutGroup}>
        <Pressable
          onPress={onSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={({pressed}) => [
            styles.signOutRow,
            pressed && {backgroundColor: theme.dangerSoft},
          ]}>
          <LogoutMiniIcon color={theme.danger} size={16} />
          <Text style={[styles.signOutText, {color: theme.danger}]}>
            Sign out
          </Text>
        </Pressable>
      </Group>

      <Text style={[styles.footer, {color: theme.textMuted}]}>
        {ORGANIZATION}
        {'\n'}
        {WORKSPACE}
      </Text>
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
  style,
}: {
  theme: ClaimPortalTheme;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.group,
        {backgroundColor: theme.card, borderColor: theme.border},
        style,
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
      <Text style={[styles.rowLabel, {color: theme.text}]} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text
          style={[styles.rowValue, {color: theme.textSecondary}]}
          numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <ChevronRightIcon color={theme.textMuted} size={8} />
      ) : (
        <View style={styles.chevronSpacer} />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}, ${value}` : label}
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

function SwitchRow({
  theme,
  icon,
  iconBg,
  label,
  hint,
  value,
  last,
  onValueChange,
}: {
  theme: ClaimPortalTheme;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  hint: string;
  value: boolean;
  last?: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View
      style={[
        styles.row,
        last && styles.rowLast,
        {borderBottomColor: theme.border},
      ]}>
      <View style={[styles.iconWrap, {backgroundColor: iconBg}]}>{icon}</View>
      <View style={styles.switchCopy}>
        <Text style={[styles.rowLabel, {color: theme.text}]}>{label}</Text>
        <Text style={[styles.rowHint, {color: theme.textMuted}]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{false: theme.border, true: theme.primary}}
        ios_backgroundColor={theme.border}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  identity: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  jobTitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  pills: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editButton: {
    marginTop: 14,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  group: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    minHeight: 52,
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
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flexShrink: 0,
    fontSize: 16,
    fontWeight: '500',
  },
  rowValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
  },
  switchCopy: {
    flex: 1,
    paddingRight: 8,
  },
  rowHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  chevronSpacer: {
    width: 8,
  },
  signOutGroup: {
    marginTop: 22,
  },
  signOutRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
