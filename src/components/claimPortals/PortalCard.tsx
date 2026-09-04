import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortal} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getAvatarColor, getInitials} from '../../theme/claimPortals';
import {ChevronRightIcon, DotsIcon} from './ClaimPortalsIcons';
import {UiIcon} from './UiIcon';

type PortalCardProps = {
  theme: ClaimPortalTheme;
  portal: ClaimPortal;
  onPress: () => void;
  onMenuPress: () => void;
};

export function PortalCard({
  theme,
  portal,
  onPress,
  onMenuPress,
}: PortalCardProps) {
  const isActive = portal.status.toLowerCase() === 'active';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${portal.name}, ${portal.status}`}
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
          style={[
            styles.avatar,
            {backgroundColor: getAvatarColor(portal.name)},
          ]}>
          <Text style={styles.avatarText}>{getInitials(portal.name)}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, {color: theme.text}]} numberOfLines={1}>
            {portal.name}
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isActive
                  ? theme.successSoft
                  : theme.dangerSoft,
              },
            ]}>
            <Text
              style={[
                styles.badgeText,
                {color: isActive ? theme.success : theme.danger},
              ]}>
              {portal.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onMenuPress}
          accessibilityRole="button"
          accessibilityLabel={`Actions for ${portal.name}`}
          hitSlop={8}
          style={styles.menuButton}>
          <DotsIcon color={theme.textMuted} />
        </Pressable>
      </View>

      {portal.meta.length > 0 ? (
        <View style={styles.metaRow}>
          {portal.meta.map(field => (
            <View key={field.id} style={styles.meta}>
              <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
                {field.label}
              </Text>
              <Text style={[styles.metaValue, {color: theme.text}]}>
                {field.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        {portal.metrics.map(metric => (
          <View key={metric.id} style={styles.metric}>
            <UiIcon name={metric.icon} color={theme.textMuted} size={14} />
            <Text style={[styles.metricText, {color: theme.textSecondary}]}>
              {metric.value}
            </Text>
          </View>
        ))}
        <View style={styles.spacer} />
        <ChevronRightIcon color={theme.textMuted} />
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
    fontWeight: '800',
    fontSize: 15,
  },
  titleBlock: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 12,
  },
  meta: {
    flexGrow: 1,
    minWidth: '40%',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaValue: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 14,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
});
