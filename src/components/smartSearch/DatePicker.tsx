import React, {useEffect, useMemo, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {ChevronLeftIcon, ChevronRightIcon} from '../claimPortals/ClaimPortalsIcons';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseIsoDate(value?: string): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date();
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatSearchDate(value?: string): string {
  if (!value) {
    return '';
  }
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) {
    return value;
  }
  return `${day}-${month}-${year}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

type DatePickerProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  title: string;
  value?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function DatePicker({
  visible,
  theme,
  title,
  value,
  onClose,
  onSelect,
}: DatePickerProps) {
  const selected = useMemo(() => (value ? parseIsoDate(value) : null), [value]);
  const [cursor, setCursor] = useState(() => parseIsoDate(value));

  useEffect(() => {
    if (visible) {
      setCursor(parseIsoDate(value));
    }
  }, [visible, value]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const cells = [
    ...Array.from({length: firstWeekday}, () => null),
    ...Array.from({length: totalDays}, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const shiftMonth = (delta: number) => {
    setCursor(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, {backgroundColor: theme.overlay}]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close date picker"
        />
        <View
          style={[
            styles.sheet,
            {backgroundColor: theme.sheet, borderColor: theme.border},
          ]}>
          <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
          <View style={styles.monthRow}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={[styles.monthNav, {borderColor: theme.border}]}>
              <ChevronLeftIcon color={theme.text} size={9} />
            </Pressable>
            <Text style={[styles.monthLabel, {color: theme.text}]}>
              {MONTHS[month]} {year}
            </Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={[styles.monthNav, {borderColor: theme.border}]}>
              <ChevronRightIcon color={theme.text} size={9} />
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {WEEKDAYS.map(day => (
              <Text key={day} style={[styles.weekday, {color: theme.textMuted}]}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              const iso = toIsoDate(new Date(year, month, day));
              const isSelected = selected ? toIsoDate(selected) === iso : false;
              return (
                <Pressable
                  key={iso}
                  onPress={() => {
                    onSelect(iso);
                    onClose();
                  }}
                  style={[
                    styles.dayCell,
                    styles.dayButton,
                    isSelected && {backgroundColor: theme.primary},
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      {color: isSelected ? theme.onPrimary : theme.text},
                    ]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthNav: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    borderRadius: 999,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
