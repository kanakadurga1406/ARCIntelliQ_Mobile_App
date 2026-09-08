import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {PortalAction} from '../../types/claimPortals';
import type {ClaimRecord} from '../../types/claims';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {getToneColors, UiIcon} from '../claimPortals/UiIcon';

type ClaimDetailSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  claim: ClaimRecord | null;
  actions: PortalAction[];
  onClose: () => void;
  onAction: (action: PortalAction) => void;
};

export function ClaimDetailSheet({
  visible,
  theme,
  claim,
  actions,
  onClose,
  onAction,
}: ClaimDetailSheetProps) {
  if (!claim) {
    return null;
  }

  const tone = getToneColors(theme, claim.status.tone);

  return (
    <BottomSheet
      visible={visible}
      title={claim.incidentNumber}
      theme={theme}
      onClose={onClose}>
      <View style={styles.statusRow}>
        <View style={[styles.badge, {backgroundColor: tone.bg}]}>
          <Text style={[styles.badgeText, {color: tone.fg}]}>
            {claim.status.label.toUpperCase()}
          </Text>
        </View>
        {claim.status.hint ? (
          <Text style={[styles.hint, {color: theme.textMuted}]}>
            {claim.status.hint}
          </Text>
        ) : null}
      </View>

      {claim.location ? (
        <View style={styles.row}>
          <Text style={[styles.label, {color: theme.textMuted}]}>Location</Text>
          <Text style={[styles.value, {color: theme.text}]}>{claim.location}</Text>
        </View>
      ) : null}

      {claim.fields.map(field => (
        <View key={field.id} style={styles.row}>
          <Text style={[styles.label, {color: theme.textMuted}]}>
            {field.label}
          </Text>
          <View style={styles.valueRow}>
            {field.icon ? (
              <UiIcon name={field.icon} color={theme.textMuted} size={13} />
            ) : null}
            <Text style={[styles.value, {color: theme.text}]}>{field.value}</Text>
          </View>
        </View>
      ))}

      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map(action => {
            const actionTone = getToneColors(theme, action.tone);
            return (
              <Pressable
                key={action.id}
                onPress={() => onAction(action)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({pressed}) => [
                  styles.action,
                  {
                    backgroundColor: theme.cardMuted,
                    borderColor: theme.border,
                  },
                  pressed && {opacity: 0.86},
                ]}>
                <UiIcon name={action.icon} color={actionTone.fg} size={15} />
                <Text style={[styles.actionText, {color: theme.text}]}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
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
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EEF5',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  valueRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    marginTop: 16,
    gap: 8,
  },
  action: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
