import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {UserBusinessOption, UserFilters} from '../../types/users';
import type {SortOption, StatusChip} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {BottomSheet} from '../claimPortals/BottomSheet';

type UserFilterSheetProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  value: UserFilters;
  businesses: UserBusinessOption[];
  userTypes: string[];
  statusChips: StatusChip[];
  sortOptions: SortOption[];
  onClose: () => void;
  onApply: (next: UserFilters) => void;
};

export function UserFilterSheet({
  visible,
  theme,
  value,
  businesses,
  userTypes,
  statusChips,
  sortOptions,
  onClose,
  onApply,
}: UserFilterSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const typeOptions = [
    {id: 'all', label: 'All types'},
    {id: 'none', label: 'No type'},
    ...userTypes.map(item => ({id: item, label: item})),
  ];

  return (
    <BottomSheet
      visible={visible}
      title="Filter users"
      theme={theme}
      onClose={onClose}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
          STATUS
        </Text>
        <View style={styles.rowWrap}>
          {statusChips.map(option => {
            const selected = draft.status === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() =>
                  setDraft(current => ({...current, status: option.id}))
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

        <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
          BUSINESS
        </Text>
        <View style={styles.rowWrap}>
          {businesses.map(option => {
            const selected = draft.businessId === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() =>
                  setDraft(current => ({...current, businessId: option.id}))
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

        <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
          USER TYPE
        </Text>
        <View style={styles.rowWrap}>
          {typeOptions.map(option => {
            const selected = draft.userType === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() =>
                  setDraft(current => ({...current, userType: option.id}))
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

        <Text style={[styles.sectionLabel, {color: theme.textMuted}]}>
          SORT BY
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

        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              setDraft({
                status: 'all',
                businessId: 'all',
                userType: 'all',
                sortBy: sortOptions[0]?.id ?? 'latest',
              })
            }
            style={[styles.reset, {borderColor: theme.border}]}>
            <Text style={[styles.resetText, {color: theme.text}]}>Reset</Text>
          </Pressable>
          <Pressable
            onPress={() => onApply(draft)}
            style={[styles.apply, {backgroundColor: theme.primary}]}>
            <Text style={[styles.applyText, {color: theme.onPrimary}]}>
              Apply
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
});
