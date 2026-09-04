import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {PortalStats} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {
  BoxIcon,
  BuildingIcon,
  CalendarIcon,
  ChevronRightIcon,
  DocumentIcon,
  LayersIcon,
} from './ClaimPortalsIcons';

type KpiGridProps = {
  theme: ClaimPortalTheme;
  stats: PortalStats;
  onBusinessRequestsPress: () => void;
};

type KpiItem = {
  key: keyof PortalStats['trends'];
  title: string;
  value: number;
  trend: number;
  iconBg: string;
  Icon: React.ComponentType<{color?: string; size?: number}>;
  iconColor: string;
};

export function KpiGrid({
  theme,
  stats,
  onBusinessRequestsPress,
}: KpiGridProps) {
  const cards: KpiItem[] = [
    {
      key: 'total',
      title: 'Total Portals',
      value: stats.total,
      trend: stats.trends.total,
      iconBg: '#E8F1FF',
      Icon: BuildingIcon,
      iconColor: theme.primary,
    },
    {
      key: 'active',
      title: 'Active Portals',
      value: stats.active,
      trend: stats.trends.active,
      iconBg: theme.successSoft,
      Icon: LayersIcon,
      iconColor: theme.success,
    },
    {
      key: 'inactive',
      title: 'Inactive Portals',
      value: stats.inactive,
      trend: stats.trends.inactive,
      iconBg: theme.warningSoft,
      Icon: BoxIcon,
      iconColor: theme.orange,
    },
    {
      key: 'newThisMonth',
      title: 'New This Month',
      value: stats.newThisMonth,
      trend: stats.trends.newThisMonth,
      iconBg: theme.purpleSoft,
      Icon: CalendarIcon,
      iconColor: theme.purple,
    },
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        <View style={styles.row}>
          {cards.slice(0, 2).map(card => (
            <KpiCard key={card.key} card={card} theme={theme} />
          ))}
        </View>
        <View style={styles.row}>
          {cards.slice(2, 4).map(card => (
            <KpiCard key={card.key} card={card} theme={theme} />
          ))}
        </View>
      </View>

      <Pressable
        onPress={onBusinessRequestsPress}
        accessibilityRole="button"
        accessibilityLabel="View business requests"
        style={({pressed}) => [
          styles.wideCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
          pressed && {opacity: 0.92},
        ]}>
        <View style={[styles.iconBadge, {backgroundColor: theme.goldSoft}]}>
          <DocumentIcon color={theme.gold} />
        </View>
        <View style={styles.wideCopy}>
          <Text style={[styles.cardTitle, {color: theme.textSecondary}]}>
            Business Requests
          </Text>
          <Text style={[styles.value, {color: theme.text}]}>
            {stats.businessRequests}
          </Text>
          <TrendText value={stats.trends.businessRequests} theme={theme} />
        </View>
        <ChevronRightIcon color={theme.textMuted} />
      </Pressable>
    </View>
  );
}

function KpiCard({
  card,
  theme,
}: {
  card: KpiItem;
  theme: ClaimPortalTheme;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      <View style={[styles.iconBadge, {backgroundColor: card.iconBg}]}>
        <card.Icon color={card.iconColor} />
      </View>
      <Text style={[styles.cardTitle, {color: theme.textSecondary}]}>
        {card.title}
      </Text>
      <Text style={[styles.value, {color: theme.text}]}>{card.value}</Text>
      <TrendText value={card.trend} theme={theme} />
    </View>
  );
}

function TrendText({
  value,
  theme,
}: {
  value: number;
  theme: ClaimPortalTheme;
}) {
  const isUp = value >= 0;
  return (
    <Text
      style={[
        styles.trend,
        {color: isUp ? theme.success : theme.danger},
      ]}>
      {isUp ? '▲' : '▼'} {Math.abs(value)}% vs last month
    </Text>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  wideCopy: {
    flex: 1,
    marginLeft: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    marginTop: 4,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
  },
  trend: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
