import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortal} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {
  ChevronRightIcon,
  CrownIcon,
} from './ClaimPortalsIcons';
import {UiIcon} from './UiIcon';

type PortalCardProps = {
  theme: ClaimPortalTheme;
  portal: ClaimPortal;
  onPress: () => void;
  onMenuPress?: () => void;
};

const AVATAR_BG = '#FFF3C4';
const AVATAR_FG = '#C9A227';
const STATUS_DOT = '#16A34A';
const ARROW_BG = '#FFE4C8';
const ARROW_FG = '#EA580C';
const METRIC_BLUE = '#2B74FF';
const DIVIDER = '#E6EAF0';

function firstLetter(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : 'B';
}

export function PortalCard({theme, portal, onPress}: PortalCardProps) {
  const isActive = portal.status.toLowerCase() === 'active';
  const isMaster = (portal.flags ?? []).includes('master');
  const businessId =
    portal.meta.find(field => field.id === 'businessId')?.value ||
    portal.businessId;
  const createdDate =
    portal.meta.find(field => field.id === 'createdAt')?.value ||
    portal.createdAt;
  const metrics =
    portal.metrics.length > 0
      ? portal.metrics
      : [
          {id: 'linked', value: 0, icon: 'briefcase'},
          {id: 'docs', value: 0, icon: 'folder'},
          {id: 'week', value: 0, icon: 'calendar'},
        ];

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
        pressed && {opacity: 0.96},
      ]}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, {backgroundColor: AVATAR_BG}]}>
          <Text style={[styles.avatarText, {color: AVATAR_FG}]}>
            {firstLetter(portal.name)}
          </Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, {color: theme.text}]} numberOfLines={1}>
            {portal.name}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isActive
                    ? theme.successSoft
                    : theme.dangerSoft,
                },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: isActive ? STATUS_DOT : theme.danger},
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  {color: isActive ? theme.success : theme.danger},
                ]}>
                {portal.status.toUpperCase()}
              </Text>
            </View>
            {isMaster ? (
              <View style={styles.crownWrap}>
                <CrownIcon color="#C9A227" size={12} />
              </View>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Open ${portal.name}`}
          style={styles.arrowButton}>
          <ChevronRightIcon color={ARROW_FG} size={9} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
            BUSINESS ID
          </Text>
          <Text style={[styles.metaValue, {color: theme.text}]}>
            {businessId || '—'}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.metaLabel, {color: theme.textMuted}]}>
            CREATED DATE
          </Text>
          <Text style={[styles.metaValue, {color: theme.text}]}>
            {createdDate || '—'}
          </Text>
        </View>
      </View>

      <View style={[styles.footer, {borderTopColor: DIVIDER}]}>
        {metrics.slice(0, 3).map((metric, index) => (
          <View key={metric.id} style={styles.metricCell}>
            {index > 0 ? (
              <View style={[styles.metricDivider, {backgroundColor: DIVIDER}]} />
            ) : null}
            <View style={styles.metric}>
              <UiIcon name={metric.icon} color={METRIC_BLUE} size={15} />
              <Text style={[styles.metricText, {color: METRIC_BLUE}]}>
                {metric.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    marginBottom: 12,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 18,
  },
  titleBlock: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  crownWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF3C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: ARROW_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 14,
    gap: 16,
  },
  meta: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    minHeight: 46,
  },
  metricCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricDivider: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 1,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
