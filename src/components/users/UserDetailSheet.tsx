import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {AppUser} from '../../types/users';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getAvatarColor, getInitials} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {UiIcon} from '../claimPortals/UiIcon';
import {formatUserDate} from '../../utils/userList';

type UserDetailSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  user: AppUser | null;
  onClose: () => void;
  onEdit: () => void;
  onAccess: () => void;
  onDelete: () => void;
};

export function UserDetailSheet({
  visible,
  theme,
  user,
  onClose,
  onEdit,
  onAccess,
  onDelete,
}: UserDetailSheetProps) {
  const isActive = user?.status === 'active';
  const portal =
    theme.scheme === 'dark'
      ? {bg: '#16332F', fg: '#5EEAD4'}
      : {bg: '#E7F6F3', fg: '#0F766E'};

  return (
    <BottomSheet
      visible={visible}
      title="User details"
      theme={theme}
      onClose={onClose}>
      {user ? (
        <>
          <View style={styles.hero}>
            <View
              style={[
                styles.avatar,
                {backgroundColor: getAvatarColor(user.name)},
              ]}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.name, {color: theme.text}]} numberOfLines={2}>
                {user.name}
              </Text>
              <Text
                style={[styles.email, {color: theme.textSecondary}]}
                numberOfLines={2}>
                {user.email}
              </Text>
            </View>
          </View>

          <View style={styles.pills}>
            <View
              style={[
                styles.pill,
                {
                  backgroundColor: isActive
                    ? theme.successSoft
                    : theme.dangerSoft,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {color: isActive ? theme.success : theme.danger},
                ]}>
                {isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View style={[styles.pill, {backgroundColor: portal.bg}]}>
              <Text style={[styles.pillText, {color: portal.fg}]}>
                {user.portalName} / {user.role}
              </Text>
            </View>
            {user.userType ? (
              <View style={[styles.pill, {backgroundColor: theme.purpleSoft}]}>
                <Text style={[styles.pillText, {color: theme.purple}]}>
                  {user.userType}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.metaCard, {backgroundColor: theme.cardMuted}]}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
                Created date
              </Text>
              <Text style={[styles.metaValue, {color: theme.text}]}>
                {formatUserDate(user.createdAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
                Last login
              </Text>
              <Text style={[styles.metaValue, {color: theme.text}]}>
                {formatUserDate(user.lastLoginAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
                Portal
              </Text>
              <Text style={[styles.metaValue, {color: theme.text}]}>
                {user.portalName}
              </Text>
            </View>
            <View style={[styles.metaRow, styles.metaRowLast]}>
              <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
                Role
              </Text>
              <Text style={[styles.metaValue, {color: theme.text}]}>
                {user.role}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit user"
              style={[styles.action, {backgroundColor: theme.primary}]}>
              <UiIcon name="pencil" color={theme.onPrimary} />
              <Text style={[styles.actionText, {color: theme.onPrimary}]}>
                Edit
              </Text>
            </Pressable>
            <Pressable
              onPress={onAccess}
              accessibilityRole="button"
              accessibilityLabel="Manage portal access"
              style={[
                styles.action,
                styles.actionOutline,
                {backgroundColor: theme.card, borderColor: theme.border},
              ]}>
              <UiIcon name="key" color={theme.primary} />
              <Text style={[styles.actionText, {color: theme.text}]}>Access</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete user"
              style={[styles.action, {backgroundColor: theme.dangerSoft}]}>
              <UiIcon name="trash" color={theme.danger} />
              <Text style={[styles.actionText, {color: theme.danger}]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
  heroCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(16,35,63,0.08)',
  },
  metaRowLast: {
    borderBottomWidth: 0,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  action: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  actionOutline: {
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
