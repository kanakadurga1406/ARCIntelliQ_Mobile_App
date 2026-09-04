import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {
  ClaimPortal,
  PortalAction,
  PortalFilters,
  SortOption,
  StatusChip,
  SummaryRow,
} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from './BottomSheet';
import {getToneColors, UiIcon} from './UiIcon';

type FilterSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  value: PortalFilters;
  statusChips: StatusChip[];
  sortOptions: SortOption[];
  onClose: () => void;
  onApply: (next: PortalFilters) => void;
};

export function FilterSheet({
  visible,
  theme,
  value,
  statusChips,
  sortOptions,
  onClose,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  return (
    <BottomSheet
      visible={visible}
      title="Filter Portals"
      theme={theme}
      onClose={onClose}>
      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        STATUS
      </Text>
      <View style={styles.rowWrap}>
        {statusChips.map(option => {
          const selected = draft.status === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setDraft(current => ({...current, status: option.id}))}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? theme.primary : theme.chip,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {color: selected ? theme.onPrimary : theme.chipText},
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        CREATED DATE
      </Text>
      <View style={styles.dateRow}>
        <DateField
          theme={theme}
          label="From"
          value={draft.fromDate}
          onChangeText={fromDate => setDraft(current => ({...current, fromDate}))}
        />
        <DateField
          theme={theme}
          label="To"
          value={draft.toDate}
          onChangeText={toDate => setDraft(current => ({...current, toDate}))}
        />
      </View>

      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        SORT BY
      </Text>
      <View style={styles.rowWrap}>
        {sortOptions.map(option => {
          const selected = draft.sortBy === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setDraft(current => ({...current, sortBy: option.id}))}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? theme.primary : theme.chip,
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {color: selected ? theme.onPrimary : theme.chipText},
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={() =>
            setDraft({
              status: statusChips[0]?.id ?? 'all',
              fromDate: '',
              toDate: '',
              sortBy: sortOptions[0]?.id ?? 'latest',
            })
          }
          style={[styles.reset, {borderColor: theme.border}]}>
          <Text style={[styles.resetText, {color: theme.text}]}>Reset</Text>
        </Pressable>
        <Pressable
          onPress={() => onApply(draft)}
          style={[styles.apply, {backgroundColor: theme.primary}]}>
          <Text style={[styles.applyText, {color: theme.onPrimary}]}>Apply</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

function DateField({
  theme,
  label,
  value,
  onChangeText,
}: {
  theme: ClaimPortalTheme;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.dateField}>
      <Text style={[styles.dateLabel, {color: theme.textSecondary}]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.textMuted}
        autoCapitalize="none"
        style={[
          styles.dateInput,
          {color: theme.text, backgroundColor: theme.input, borderColor: theme.border},
        ]}
      />
    </View>
  );
}

type ActionsSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  portal: ClaimPortal | null;
  actions: PortalAction[];
  onClose: () => void;
  onAction: (action: PortalAction) => void;
};

export function PortalActionsSheet({
  visible,
  theme,
  portal,
  actions,
  onClose,
  onAction,
}: ActionsSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      title="Portal Actions"
      theme={theme}
      onClose={onClose}>
      {portal ? (
        <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
          {portal.name}
        </Text>
      ) : null}
      {actions.map(action => {
        const destructive = action.tone === 'danger';
        return (
          <ActionRow
            key={action.id}
            theme={theme}
            label={action.label}
            icon={
              <UiIcon
                name={action.icon}
                color={destructive ? theme.danger : theme.text}
              />
            }
            destructive={destructive}
            onPress={() => onAction(action)}
          />
        );
      })}
    </BottomSheet>
  );
}

function ActionRow({
  theme,
  label,
  icon,
  onPress,
  destructive,
}: {
  theme: ClaimPortalTheme;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.actionRow,
        {backgroundColor: pressed ? theme.cardMuted : theme.card},
      ]}>
      <View style={[styles.actionIcon, {backgroundColor: theme.chip}]}>
        {icon}
      </View>
      <Text
        style={[
          styles.actionLabel,
          {color: destructive ? theme.danger : theme.text},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

type RequestsSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  rows: SummaryRow[];
  onClose: () => void;
  onViewAll: () => void;
};

export function BusinessRequestsSheet({
  visible,
  theme,
  rows,
  onClose,
  onViewAll,
}: RequestsSheetProps) {

  return (
    <BottomSheet
      visible={visible}
      title="Business Requests"
      theme={theme}
      onClose={onClose}>
      {rows.map(row => {
        const tone = getToneColors(theme, row.tone);
        return (
          <View
            key={row.id}
            style={[styles.requestRow, {borderColor: theme.border}]}>
            <View style={[styles.actionIcon, {backgroundColor: theme.chip}]}>
              {row.icon ? <UiIcon name={row.icon} color={tone.fg} /> : null}
            </View>
            <Text style={[styles.actionLabel, {color: theme.text}]}>
              {row.label}
            </Text>
            <Text style={[styles.requestValue, {color: theme.text}]}>
              {row.value}
            </Text>
          </View>
        );
      })}
      <Pressable
        onPress={onViewAll}
        style={[styles.apply, {backgroundColor: theme.primary, marginTop: 16}]}>
        <Text style={[styles.applyText, {color: theme.onPrimary}]}>
          View All Requests
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 6,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  reset: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '700',
  },
  apply: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: -8,
    marginBottom: 10,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  requestValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
