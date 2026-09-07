import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {StatCard} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getToneColors, UiIcon} from './UiIcon';

type KpiGridProps = {
  theme: ClaimPortalTheme;
  cards: StatCard[];
  onCardPress?: (card: StatCard) => void;
};

function chunkCards(cards: StatCard[], size = 2): StatCard[][] {
  const rows: StatCard[][] = [];
  for (let index = 0; index < cards.length; index += size) {
    rows.push(cards.slice(index, index + size));
  }
  return rows;
}

export function KpiGrid({theme, cards, onCardPress}: KpiGridProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.grid}>
      {chunkCards(cards).map((row, rowIndex) => (
        <View key={`kpi-row-${rowIndex}`} style={styles.row}>
          {row.map(card => (
            <KpiCard
              key={card.id}
              card={card}
              theme={theme}
              onPress={
                card.destination && onCardPress
                  ? () => onCardPress(card)
                  : undefined
              }
            />
          ))}
          {row.length === 1 ? <View style={styles.spacer} /> : null}
        </View>
      ))}
    </View>
  );
}

function KpiCard({
  card,
  theme,
  onPress,
}: {
  card: StatCard;
  theme: ClaimPortalTheme;
  onPress?: () => void;
}) {
  const tone = getToneColors(theme, card.tone);
  const content = (
    <>
      <View style={[styles.iconBadge, {backgroundColor: tone.bg}]}>
        <UiIcon name={card.icon} color={tone.fg} />
      </View>
      <Text style={[styles.cardTitle, {color: theme.textSecondary}]}>
        {card.title}
      </Text>
      <Text style={[styles.value, {color: theme.text}]}>{card.value}</Text>
      {typeof card.trend === 'number' ? (
        <TrendText value={card.trend} theme={theme} />
      ) : null}
    </>
  );

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.card,
      borderColor: theme.border,
      shadowColor: theme.shadow,
    },
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={card.title}
        style={({pressed}) => [...cardStyle, pressed && {opacity: 0.92}]}>
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
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
    <Text style={[styles.trend, {color: isUp ? theme.success : theme.danger}]}>
      {isUp ? '▲' : '▼'} {Math.abs(value)}% vs last month
    </Text>
  );
}

const styles = StyleSheet.create({
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
  spacer: {
    flex: 1,
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
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  trend: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
  },
});
