import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {SortOption, StatusChip} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {colors} from '../../theme/colors';
import {ChevronDownIcon, FilterIcon, SearchIcon} from './ClaimPortalsIcons';

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
        <View style={styles.searchBox}>
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
            pressed && {transform: [{scale: 0.96}], opacity: 0.9},
          ]}>
          <FilterIcon color={colors.onPrimary} />
          {filterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View style={styles.chips}>
        {chips.map((chip, index) => {
          const selected = chip.id === activeStatus;
          const countLabel =
            typeof chip.count === 'number' ? ` (${chip.count})` : '';
          return (
            <Pressable
              key={`${chip.id}-${index}`}
              onPress={() => onStatusChange(chip.id)}
              accessibilityRole="button"
              accessibilityState={{selected}}
              style={({pressed}) => [
                styles.chip,
                selected ? styles.chipActive : styles.chipIdle,
                pressed && {transform: [{scale: 0.97}], opacity: 0.9},
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {color: selected ? colors.onPrimary : colors.navy},
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
            accessibilityLabel="Change sort order"
            style={styles.sortRow}>
            <Text style={styles.sort}>Sort by: {sortLabel}</Text>
            <ChevronDownIcon color={colors.primary} size={12} />
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
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    padding: 0,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.navy,
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
    marginTop: 14,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipIdle: {
    backgroundColor: '#E7EEF6',
  },
  chipText: {
    fontSize: 13,
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sort: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
