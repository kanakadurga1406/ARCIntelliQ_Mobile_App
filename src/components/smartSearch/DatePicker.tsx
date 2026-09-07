import React, {useEffect, useState} from 'react';
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
  const [cursor, setCursor] = useState(() => parseIsoDate(value));
  const [draft, setDraft] = useState(() => toIsoDate(parseIsoDate(value)));

  useEffect(() => {
    if (visible) {
      const next = parseIsoDate(value);
      setCursor(next);
      setDraft(value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '');
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

  const apply = () => {
    if (!draft) {
      return;
    }
    onSelect(draft);
    onClose();
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
            styles.card,
            {
              backgroundColor: theme.sheet,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}>
          <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
          <Text style={[styles.chosen, {color: theme.primary}]}>
            {draft ? formatSearchDate(draft) : 'Select a day'}
          </Text>

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
              const isSelected = draft === iso;
              return (
                <Pressable
                  key={iso}
                  onPress={() => setDraft(iso)}
                  accessibilityRole="button"
                  accessibilityLabel={iso}
                  style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayInner,
                      isSelected && {backgroundColor: theme.primary},
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        {color: isSelected ? theme.onPrimary : theme.text},
                      ]}>
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={[styles.button, {borderColor: theme.border, backgroundColor: theme.card}]}>
              <Text style={[styles.buttonText, {color: theme.text}]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={apply}
              disabled={!draft}
              accessibilityRole="button"
              accessibilityLabel="Done"
              style={[
                styles.button,
                {
                  backgroundColor: theme.primary,
                  borderColor: 'transparent',
                  opacity: draft ? 1 : 0.45,
                },
              ]}>
              <Text style={[styles.buttonText, {color: theme.onPrimary}]}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  chosen: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
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
    marginBottom: 4,
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
    width: '14.2857%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    minHeight: 40,
    minWidth: 84,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
