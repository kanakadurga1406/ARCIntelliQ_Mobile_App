import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {SortOption, StatusChip} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {FilterIcon, SearchIcon} from './ClaimPortalsIcons';

type PortalListControlsProps = {
  theme: ClaimPortalTheme;
  query: string;
  onQueryChange: (value: string) => void;
  chips: StatusChip[];
  activeStatus: string;
  onStatusChange: (status: string) => void;
  filterCount: number;
  sortOptions: SortOption[];
  sortBy: string;
  onSortPress: () => void;
  onFilterPress: () => void;
  resultCount: number;
  loadedCount: number;
  searchFocusToken?: number;
  searchPlaceholder?: string;
  countNoun?: string;
};

export function PortalListControls({
  theme,
  query,
  onQueryChange,
  chips,
  activeStatus,
  onStatusChange,
  filterCount,
  sortOptions,
  sortBy,
  onSortPress,
  onFilterPress,
  resultCount,
  loadedCount,
  searchFocusToken = 0,
  searchPlaceholder = 'Search portals...',
  countNoun = 'portals',
}: PortalListControlsProps) {
  const sortLabel =
    sortOptions.find(option => option.id === sortBy)?.label || 'Latest';

  return (
    <View>
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBox,
            {backgroundColor: theme.input, borderColor: theme.border},
          ]}>
          <SearchIcon color={theme.textMuted} />
          <TextInput
            key={`portal-search-${searchFocusToken}`}
            value={query}
            onChangeText={onQueryChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={searchFocusToken > 0}
            style={[styles.searchInput, {color: theme.text}]}
          />
        </View>
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filter portals"
          style={({pressed}) => [
            styles.filterButton,
            {backgroundColor: theme.card, borderColor: theme.border},
            pressed && {opacity: 0.85},
          ]}>
          <FilterIcon color={theme.text} />
          {filterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.chips}>
        {chips.map(chip => {
          const selected = chip.id === activeStatus;
          const countLabel =
            typeof chip.count === 'number' ? ` (${chip.count})` : '';
          return (
            <Pressable
              key={chip.id}
              onPress={() => onStatusChange(chip.id)}
              accessibilityRole="button"
              accessibilityState={{selected}}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.primary : theme.chip,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {color: selected ? theme.onPrimary : theme.chipText},
                ]}>
                {chip.label}
                {countLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.count, {color: theme.textSecondary}]}>
          {loadedCount < resultCount
            ? `${loadedCount} of ${resultCount} ${countNoun}`
            : `${resultCount} ${countNoun}`}
        </Text>
        {sortOptions.length > 0 ? (
          <Pressable
            onPress={onSortPress}
            accessibilityRole="button"
            accessibilityLabel="Change sort order">
            <Text style={[styles.sort, {color: theme.primary}]}>
              Sort by: {sortLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    padding: 0,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2B74FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listHeader: {
    marginTop: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
  },
  sort: {
    fontSize: 13,
    fontWeight: '700',
  },
});
