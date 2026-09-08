import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimRecord} from '../../types/claims';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {ChevronRightIcon} from '../claimPortals/ClaimPortalsIcons';
import {getToneColors, UiIcon} from '../claimPortals/UiIcon';

type ClaimCardProps = {
  theme: ClaimPortalTheme;
  claim: ClaimRecord;
  onPress: () => void;
};

export function ClaimCard({theme, claim, onPress}: ClaimCardProps) {
  const tone = getToneColors(theme, claim.status.tone);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${claim.incidentNumber}, ${claim.status.label}`}
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
        <View style={styles.titleBlock}>
          <Text style={[styles.incident, {color: theme.text}]} numberOfLines={1}>
            {claim.incidentNumber}
          </Text>
          {claim.location ? (
            <Text
              style={[styles.location, {color: theme.textSecondary}]}
              numberOfLines={1}>
              {claim.location}
            </Text>
          ) : null}
        </View>
        <View style={[styles.badge, {backgroundColor: tone.bg}]}>
          <Text style={[styles.badgeText, {color: tone.fg}]}>
            {claim.status.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {claim.status.hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]} numberOfLines={1}>
          {claim.status.hint}
        </Text>
      ) : null}

      {claim.fields.length > 0 ? (
        <View style={styles.fields}>
          {claim.fields.map(field => (
            <View key={field.id} style={styles.field}>
              <Text style={[styles.fieldLabel, {color: theme.textMuted}]}>
                {field.label}
              </Text>
              <View style={styles.fieldValueRow}>
                {field.icon ? (
                  <UiIcon name={field.icon} color={theme.textMuted} size={12} />
                ) : null}
                <Text
                  style={[styles.fieldValue, {color: theme.text}]}
                  numberOfLines={2}>
                  {field.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={[styles.footerHint, {color: theme.textMuted}]}>
          View claim
        </Text>
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
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  incident: {
    fontSize: 16,
    fontWeight: '800',
  },
  location: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  fields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 12,
  },
  field: {
    minWidth: '44%',
    flexGrow: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  fieldValueRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerHint: {
    fontSize: 12,
    fontWeight: '600',
  },
});
