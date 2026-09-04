import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {
  PortalSortOption,
  PortalStats,
  PortalStatusFilter,
} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {FilterIcon, SearchIcon} from './ClaimPortalsIcons';

type PortalListControlsProps = {
  theme: ClaimPortalTheme;
  query: string;
  onQueryChange: (value: string) => void;
  activeStatus: PortalStatusFilter;
  onStatusChange: (status: PortalStatusFilter) => void;
  stats: PortalStats;
  filterCount: number;
  sortBy: PortalSortOption;
  onSortPress: () => void;
  onFilterPress: () => void;
  resultCount: number;
  searchFocusToken?: number;
};

const STATUS_CHIPS: {
  id: PortalStatusFilter;
  label: string;
  countKey: keyof Pick<
    PortalStats,
    'total' | 'active' | 'inactive' | 'newThisMonth'
  >;
}[] = [
  {id: 'all', label: 'All', countKey: 'total'},
  {id: 'active', label: 'Active', countKey: 'active'},
  {id: 'inactive', label: 'Inactive', countKey: 'inactive'},
  {id: 'new', label: 'New', countKey: 'newThisMonth'},
];

const SORT_LABELS: Record<PortalSortOption, string> = {
  latest: 'Latest',
  oldest: 'Oldest',
  'name-asc': 'Name A-Z',
  'name-desc': 'Name Z-A',
};

export function PortalListControls({
  theme,
  query,
  onQueryChange,
  activeStatus,
  onStatusChange,
  stats,
  filterCount,
  sortBy,
  onSortPress,
  onFilterPress,
  resultCount,
  searchFocusToken = 0,
}: PortalListControlsProps) {
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
            placeholder="Search portals..."
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
        {STATUS_CHIPS.map(chip => {
          const selected = chip.id === activeStatus;
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
                {chip.label} ({stats[chip.countKey]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.count, {color: theme.textSecondary}]}>
          {resultCount} portals
        </Text>
        <Pressable
          onPress={onSortPress}
          accessibilityRole="button"
          accessibilityLabel="Change sort order">
          <Text style={[styles.sort, {color: theme.primary}]}>
            Sort by: {SORT_LABELS[sortBy]}
          </Text>
        </Pressable>
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
