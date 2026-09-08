import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {SortOption} from '../../types/claimPortals';
import type {
  ClaimDateFilter,
  ClaimFilterControl,
  ClaimFilters,
} from '../../types/claims';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';
import {DateField} from '../claimPortals/IntakeFields';

type ClaimFilterSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  value: ClaimFilters;
  filterControls: ClaimFilterControl[];
  dateFilters: ClaimDateFilter[];
  sortOptions: SortOption[];
  onClose: () => void;
  onApply: (next: ClaimFilters) => void;
};

function isoToDisplay(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return '';
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function displayToIso(value: string): string {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) {
    return '';
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function ClaimFilterSheet({
  visible,
  theme,
  value,
  filterControls,
  dateFilters,
  sortOptions,
  onClose,
  onApply,
}: ClaimFilterSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const reset = (): ClaimFilters => ({
    status: 'all',
    sortBy: sortOptions[0]?.id ?? 'latest',
    dateField: dateFilters[0]?.id ?? 'doi',
    fromDate: '',
    toDate: '',
    extras: Object.fromEntries(
      filterControls.map(control => [control.id, 'all']),
    ),
  });

  return (
    <BottomSheet
      visible={visible}
      title="Filter claims"
      theme={theme}
      onClose={onClose}>
      {dateFilters.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
            Date field
          </Text>
          <View style={styles.rowWrap}>
            {dateFilters.map(option => {
              const selected = draft.dateField === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() =>
                    setDraft(current => ({...current, dateField: option.id}))
                  }
                  style={[
                    styles.pill,
                    {backgroundColor: selected ? theme.primary : theme.chip},
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
        </>
      ) : null}

      <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
        Date range
      </Text>
      <View style={styles.dateRow}>
        <DateField
          theme={theme}
          label="From"
          flex
          allowFuture
          value={isoToDisplay(draft.fromDate)}
          onChange={next =>
            setDraft(current => ({...current, fromDate: displayToIso(next)}))
          }
        />
        <DateField
          theme={theme}
          label="To"
          flex
          allowFuture
          value={isoToDisplay(draft.toDate)}
          onChange={next =>
            setDraft(current => ({...current, toDate: displayToIso(next)}))
          }
        />
      </View>

      {filterControls.map(control => (
        <View key={control.id}>
          <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
            {control.label}
          </Text>
          <View style={styles.rowWrap}>
            {control.options.map(option => {
              const selected = (draft.extras[control.id] || 'all') === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() =>
                    setDraft(current => ({
                      ...current,
                      extras: {...current.extras, [control.id]: option.id},
                    }))
                  }
                  style={[
                    styles.pill,
                    {backgroundColor: selected ? theme.primary : theme.chip},
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
        </View>
      ))}

      {sortOptions.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
            Sort
          </Text>
          <View style={styles.rowWrap}>
            {sortOptions.map(option => {
              const selected = draft.sortBy === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() =>
                    setDraft(current => ({...current, sortBy: option.id}))
                  }
                  style={[
                    styles.pill,
                    {backgroundColor: selected ? theme.primary : theme.chip},
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
        </>
      ) : null}

      <View style={styles.footer}>
        <Pressable
          onPress={() => onApply(reset())}
          style={[styles.secondary, {borderColor: theme.border}]}>
          <Text style={[styles.secondaryText, {color: theme.text}]}>Reset</Text>
        </Pressable>
        <Pressable
          onPress={() => onApply(draft)}
          style={[styles.primary, {backgroundColor: theme.primary}]}>
          <Text style={[styles.primaryText, {color: theme.onPrimary}]}>
            Apply
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  secondary: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
  primary: {
    flex: 1.2,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
