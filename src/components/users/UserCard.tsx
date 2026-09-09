import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {AppUser} from '../../types/users';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getAvatarColor, getInitials} from '../../theme/claimPortals';
import {DotsIcon} from '../claimPortals/ClaimPortalsIcons';
import {formatUserDate} from '../../utils/userList';

type UserCardProps = {
  theme: ClaimPortalTheme;
  user: AppUser;
  onPress: () => void;
  onMenuPress: () => void;
};

function portalColors(theme: ClaimPortalTheme) {
  return theme.scheme === 'dark'
    ? {bg: '#16332F', fg: '#5EEAD4'}
    : {bg: '#E7F6F3', fg: '#0F766E'};
}

export function UserCard({theme, user, onPress, onMenuPress}: UserCardProps) {
  const isActive = user.status === 'active';
  const portal = portalColors(theme);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${user.name}, ${user.status}`}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
        pressed && {opacity: 0.94},
      ]}>
      <View style={styles.topRow}>
        <View
          style={[styles.avatar, {backgroundColor: getAvatarColor(user.name)}]}>
          <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, {color: theme.text}]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text
            style={[styles.email, {color: theme.textSecondary}]}
            numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <View
          style={[
            styles.status,
            {backgroundColor: isActive ? theme.successSoft : theme.dangerSoft},
          ]}>
          <Text
            style={[
              styles.statusText,
              {color: isActive ? theme.success : theme.danger},
            ]}>
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Pressable
          onPress={onMenuPress}
          accessibilityRole="button"
          accessibilityLabel={`Actions for ${user.name}`}
          hitSlop={8}
          style={styles.menuButton}>
          <DotsIcon color={theme.textMuted} />
        </Pressable>
      </View>

      <View style={styles.pills}>
        <View style={[styles.pill, {backgroundColor: portal.bg}]}>
          <Text style={[styles.pillText, {color: portal.fg}]} numberOfLines={1}>
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

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
            Created
          </Text>
          <Text style={[styles.metaValue, {color: theme.text}]}>
            {formatUserDate(user.createdAt)}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
            Last login
          </Text>
          <Text style={[styles.metaValue, {color: theme.text}]} numberOfLines={1}>
            {formatUserDate(user.lastLoginAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  email: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  menuButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 16,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metaValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '700',
  },
});
