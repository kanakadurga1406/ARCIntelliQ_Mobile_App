import React, {useMemo, useState} from 'react';
import {
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
import type {ProfilePage, ProfileRow, ProfileValueFrom} from '../../types/profile';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getAvatarColor, getInitials} from '../../theme/claimPortals';
import {AppDialog, useAppDialog} from './AppDialog';
import {ChevronRightIcon, LogoutMiniIcon, PencilMiniIcon} from './ClaimPortalsIcons';
import {getToneColors, UiIcon} from './UiIcon';

type ProfileSettingsProps = {
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  page: ProfilePage;
  extraFields?: ProfileField[];
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

function resolveValue(
  from: ProfileValueFrom | undefined,
  fallback: string | undefined,
  user: ClaimHandlerUser,
  fields: ProfileField[],
): string | undefined {
  if (!from) {
    return fallback;
  }
  if (from === 'user.email') {
    return user.email;
  }
  if (from === 'user.name') {
    return user.name;
  }
  if (from === 'user.title') {
    return user.title;
  }
  if (from === 'user.id') {
    return user.id.toUpperCase();
  }
  if (from === 'user.role') {
    return formatRole(user.role);
  }
  if (from.startsWith('field:')) {
    const id = from.slice(6);
    return fields.find(field => field.id === id)?.value ?? fallback;
  }
  return fallback;
}

export function ProfileSettings({
  theme,
  user,
  page,
  extraFields = [],
  onSignOut,
}: ProfileSettingsProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const {dialog, showDialog, hideDialog} = useAppDialog();
  const fields = extraFields.length > 0 ? extraFields : page.fields;
  const referencedFieldIds = useMemo(() => {
    const ids = new Set<string>();
    page.sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.valueFrom?.startsWith('field:')) {
          ids.add(row.valueFrom.slice(6));
        }
      });
    });
    return ids;
  }, [page.sections]);
  const leftoverFields = fields.filter(field => !referencedFieldIds.has(field.id));

  const shareEmail = async () => {
    try {
      await Share.share({
        title: 'Handler email',
        message: user.email,
      });
    } catch {
      showDialog({title: 'Email', message: user.email});
    }
  };

  const handleRow = (row: ProfileRow) => {
    const destination = row.destination;
    if (destination === 'sign-out') {
      onSignOut();
      return;
    }
    if (destination === 'toggle-alerts') {
      setToggles(current => ({
        ...current,
        [row.id]: !(current[row.id] ?? row.defaultOn ?? false),
      }));
      return;
    }
    if (destination === 'share-email') {
      shareEmail();
      return;
    }
    showDialog({
      title: row.label,
      message: row.message || 'This option will connect when the live API is ready.',
    });
  };

  return (
    <>
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.page}>
      <View style={styles.identity}>
        <View
          style={[
            styles.avatarRing,
            {borderColor: '#D7E4F7'},
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
          {page.badges.map(badge => {
            const tone = getToneColors(theme, badge.tone);
            return (
              <View
                key={badge.id}
                style={[
                  styles.pill,
                  {backgroundColor: tone.bg, borderColor: theme.border},
                ]}>
                {badge.tone === 'success' ? (
                  <View style={[styles.statusDot, {backgroundColor: tone.fg}]} />
                ) : null}
                <Text style={[styles.pillText, {color: tone.fg}]}>
                  {badge.id === 'role' ? formatRole(user.role) : badge.label}
                </Text>
              </View>
            );
          })}
        </View>
        <Pressable
          onPress={() =>
            showDialog({
              title: page.editTitle,
              message: page.editMessage,
            })
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
            {page.editLabel}
          </Text>
        </Pressable>
      </View>

      {page.sections.map(section => (
        <View key={section.id}>
          {section.title ? (
            <SectionLabel theme={theme} label={section.title} />
          ) : null}
          <Group
            theme={theme}
            style={!section.title ? styles.signOutGroup : undefined}>
            {section.rows.map((row, index) => {
              if (row.destination === 'toggle-theme') {
                return null;
              }
              const last = index === section.rows.length - 1;
              const tone = getToneColors(theme, row.tone);
              const value = resolveValue(row.valueFrom, row.value, user, fields);
              if (row.kind === 'sign-out') {
                return (
                  <Pressable
                    key={row.id}
                    onPress={() => handleRow(row)}
                    accessibilityRole="button"
                    accessibilityLabel={row.label}
                    style={({pressed}) => [
                      styles.signOutRow,
                      pressed && {backgroundColor: theme.dangerSoft},
                    ]}>
                    <LogoutMiniIcon color={theme.danger} size={16} />
                    <Text style={[styles.signOutText, {color: theme.danger}]}>
                      {row.label}
                    </Text>
                  </Pressable>
                );
              }
              if (row.kind === 'toggle') {
                const on = toggles[row.id] ?? row.defaultOn ?? false;
                return (
                  <SwitchRow
                    key={row.id}
                    theme={theme}
                    icon={<UiIcon name={row.icon} color={tone.fg} size={15} />}
                    iconBg={tone.bg}
                    label={row.label}
                    hint={row.hint || ''}
                    value={on}
                    last={last}
                    onValueChange={() => handleRow(row)}
                  />
                );
              }
              return (
                <SettingsRow
                  key={row.id}
                  theme={theme}
                  icon={<UiIcon name={row.icon} color={tone.fg} size={15} />}
                  iconBg={tone.bg}
                  label={row.label}
                  value={value}
                  last={last}
                  onPress={
                    row.kind === 'action' ? () => handleRow(row) : undefined
                  }
                />
              );
            })}
          </Group>
        </View>
      ))}

      {leftoverFields.length > 0 ? (
        <>
          <SectionLabel theme={theme} label="More details" />
          <Group theme={theme}>
            {leftoverFields.map((field, index) => (
              <SettingsRow
                key={field.id}
                theme={theme}
                icon={<UiIcon name="globe" color={theme.success} size={15} />}
                iconBg={theme.successSoft}
                label={field.label || 'Detail'}
                value={field.value}
                last={index === leftoverFields.length - 1}
              />
            ))}
          </Group>
        </>
      ) : null}

      <Text style={[styles.footer, {color: theme.textMuted}]}>
        {page.footerLines.join('\n')}
      </Text>
    </ScrollView>
    <AppDialog
      visible={dialog.visible}
      theme={theme}
      title={dialog.title}
      message={dialog.message}
      buttons={dialog.buttons}
      onClose={hideDialog}
    />
    </>
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
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
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
