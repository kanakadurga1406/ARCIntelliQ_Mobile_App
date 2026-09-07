import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockMiniIcon,
  CloseIcon,
} from './ClaimPortalsIcons';

export const COUNTRY_CODES = [
  '+1',
  '+7',
  '+20',
  '+27',
  '+30',
  '+31',
  '+32',
  '+33',
  '+34',
  '+36',
  '+39',
  '+40',
  '+41',
  '+43',
  '+44',
  '+45',
  '+46',
  '+47',
  '+48',
  '+49',
  '+51',
  '+52',
  '+54',
  '+55',
  '+56',
  '+57',
  '+61',
  '+62',
  '+63',
  '+64',
  '+65',
  '+66',
  '+81',
  '+82',
  '+84',
  '+86',
  '+90',
  '+91',
  '+92',
  '+94',
  '+351',
  '+352',
  '+353',
  '+354',
  '+355',
  '+356',
  '+357',
  '+358',
  '+359',
  '+370',
  '+371',
  '+372',
  '+373',
  '+380',
  '+381',
  '+385',
  '+386',
  '+420',
  '+421',
  '+852',
  '+886',
  '+966',
  '+971',
  '+972',
] as const;

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateValue(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  const year = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDateValue(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getFullYear()}`;
}

function formatDateLabel(value: string): string {
  const date = parseDateValue(value);
  if (!date) {
    return '';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseTimeValue(value: string): {
  hour12: number;
  minute: number;
  period: 'AM' | 'PM';
} {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    const now = new Date();
    const hour = now.getHours();
    return {
      hour12: hour % 12 === 0 ? 12 : hour % 12,
      minute: now.getMinutes(),
      period: hour >= 12 ? 'PM' : 'AM',
    };
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return {
    hour12: hour % 12 === 0 ? 12 : hour % 12,
    minute,
    period: hour >= 12 ? 'PM' : 'AM',
  };
}

function formatTimeValue(
  hour12: number,
  minute: number,
  period: 'AM' | 'PM',
): string {
  let hour = hour12 % 12;
  if (period === 'PM') {
    hour += 12;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function formatTimeLabel(value: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return '';
  }
  const parts = parseTimeValue(value);
  return `${parts.hour12}:${String(parts.minute).padStart(2, '0')} ${parts.period}`;
}

export const REQUIRED_MESSAGE = 'This field is required.';
const ERROR_BORDER = '#F3B6C1';

type FieldProps = {
  theme: ClaimPortalTheme;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  flex?: boolean;
  onFocus?: () => void;
};

export function FieldLabel({
  theme,
  label,
  required,
}: Omit<FieldProps, 'error'>) {
  return (
    <Text style={[styles.label, {color: theme.text}]}>
      {label}
      {required ? <Text style={styles.asterisk}> *</Text> : null}
    </Text>
  );
}

function FieldError({theme, error}: {theme: ClaimPortalTheme; error?: string}) {
  if (!error) {
    return null;
  }
  return <Text style={[styles.errorText, {color: theme.danger}]}>{error}</Text>;
}

function borderColor(theme: ClaimPortalTheme, error?: string) {
  return error ? ERROR_BORDER : theme.border;
}

export function FieldRow({children}: {children: React.ReactNode}) {
  return <View style={styles.row}>{children}</View>;
}

export function TextField({
  theme,
  label,
  required,
  error,
  hint,
  flex,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = 'sentences',
  onFocus,
}: FieldProps & {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, flex && styles.flexField]}>
      <FieldLabel theme={theme} label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType="done"
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.input,
            borderColor: error
              ? ERROR_BORDER
              : focused
                ? theme.primary
                : theme.border,
          },
        ]}
      />
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function TextAreaField({
  theme,
  label,
  required,
  error,
  hint,
  value,
  onChangeText,
  placeholder,
  onFocus,
}: FieldProps & {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <FieldLabel theme={theme} label={label} required={required} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        multiline
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          styles.area,
          {
            color: theme.text,
            backgroundColor: theme.input,
            borderColor: error
              ? ERROR_BORDER
              : focused
                ? theme.primary
                : theme.border,
          },
        ]}
      />
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function PhoneField({
  theme,
  label,
  required,
  error,
  value,
  countryCode,
  onChangeText,
  onChangeCode,
  hint,
  onFocus,
}: FieldProps & {
  value: string;
  countryCode: string;
  onChangeText: (value: string) => void;
  onChangeCode: (value: string) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedCode = countryCode || '+1';

  return (
    <View style={styles.field}>
      <FieldLabel theme={theme} label={label} required={required} />
      <View style={styles.phoneRow}>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Country code"
          style={[
            styles.prefix,
            {
              backgroundColor: theme.input,
              borderColor: borderColor(theme, error),
            },
          ]}>
          <Text style={[styles.prefixText, {color: theme.text}]}>
            {selectedCode}
          </Text>
          <ChevronDownIcon color={theme.textMuted} size={8} />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={text =>
            onChangeText(text.replace(/[^\d]/g, '').slice(0, 15))
          }
          placeholder="Enter phone number"
          placeholderTextColor={theme.textMuted}
          keyboardType="phone-pad"
          maxLength={15}
          onFocus={onFocus}
          style={[
            styles.input,
            styles.phoneInput,
            {
              color: theme.text,
              backgroundColor: theme.input,
              borderColor: borderColor(theme, error),
            },
          ]}
        />
      </View>
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
      <PickerSheet
        theme={theme}
        visible={open}
        title="Select country code"
        onClose={() => setOpen(false)}>
        <ScrollView
          style={styles.pickerList}
          keyboardShouldPersistTaps="handled">
          {COUNTRY_CODES.map(code => {
            const selected = selectedCode === code;
            return (
              <Pressable
                key={code}
                onPress={() => {
                  onChangeCode(code);
                  setOpen(false);
                }}
                style={[
                  styles.pickerItem,
                  selected && {backgroundColor: theme.primary},
                ]}>
                <Text
                  style={[
                    styles.pickerItemText,
                    {color: selected ? theme.onPrimary : theme.text},
                  ]}>
                  {code}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </PickerSheet>
    </View>
  );
}

export function SelectField({
  theme,
  label,
  required,
  error,
  hint,
  flex,
  value,
  options,
  placeholder = 'Select',
  onChange,
}: FieldProps & {
  value: string;
  options: readonly string[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchable = options.length > 8;
  const visibleOptions = searchable
    ? options.filter(option =>
        option.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  return (
    <View style={[styles.field, flex && styles.flexField]}>
      <FieldLabel theme={theme} label={label} required={required} />
      <Pressable
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.input,
          styles.select,
          {
            backgroundColor: theme.input,
            borderColor: borderColor(theme, error),
          },
        ]}>
        <Text
          style={[
            styles.selectValue,
            {color: value ? theme.text : theme.textMuted},
          ]}>
          {value || placeholder}
        </Text>
        <ChevronDownIcon color={theme.textMuted} size={8} />
      </Pressable>
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
      <PickerSheet
        theme={theme}
        visible={open}
        title={label}
        onClose={() => setOpen(false)}>
        {searchable ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search..."
            placeholderTextColor={theme.textMuted}
            autoCorrect={false}
            style={[
              styles.search,
              {
                color: theme.text,
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          />
        ) : null}
        <ScrollView style={styles.pickerList} keyboardShouldPersistTaps="handled">
          {visibleOptions.map(option => {
            const selected = value === option;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                style={[
                  styles.pickerItem,
                  selected && {backgroundColor: theme.primary},
                ]}>
                <Text
                  style={[
                    styles.pickerItemText,
                    {color: selected ? theme.onPrimary : theme.text},
                  ]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
          {visibleOptions.length === 0 ? (
            <Text style={[styles.empty, {color: theme.textMuted}]}>
              No matches
            </Text>
          ) : null}
        </ScrollView>
      </PickerSheet>
    </View>
  );
}

export function DateField({
  theme,
  label,
  required,
  error,
  hint,
  flex,
  value,
  onChange,
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = parseDateValue(value);
  const today = startOfDay(new Date());
  const initial = selected ?? today;
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );

  const openPicker = () => {
    const next = parseDateValue(value) ?? today;
    setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    setOpen(true);
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({length: firstWeekday}, () => null),
    ...Array.from({length: daysInMonth}, (_, index) => index + 1),
  ];
  const canGoNext =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth());

  return (
    <View style={[styles.field, flex && styles.flexField]}>
      <FieldLabel theme={theme} label={label} required={required} />
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.input,
          styles.select,
          {
            backgroundColor: theme.input,
            borderColor: borderColor(theme, error),
          },
        ]}>
        <CalendarIcon color={value ? theme.primary : theme.textMuted} size={15} />
        <Text
          style={[
            styles.selectValue,
            {color: value ? theme.text : theme.textMuted},
          ]}>
          {formatDateLabel(value) || 'Select date'}
        </Text>
        <ChevronDownIcon color={theme.textMuted} size={8} />
      </Pressable>
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
      <PickerSheet
        theme={theme}
        visible={open}
        title={label}
        onClose={() => setOpen(false)}>
        <View style={styles.calendar}>
          <View style={styles.calendarNav}>
            <Pressable
              onPress={() =>
                setCursor(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))
              }
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={[styles.monthButton, {backgroundColor: theme.chip}]}>
              <ChevronLeftIcon color={theme.text} size={9} />
            </Pressable>
            <Text style={[styles.monthTitle, {color: theme.text}]}>
              {MONTHS[month]} {year}
            </Text>
            <Pressable
              disabled={!canGoNext}
              onPress={() =>
                setCursor(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))
              }
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={[
                styles.monthButton,
                {backgroundColor: theme.chip, opacity: canGoNext ? 1 : 0.35},
              ]}>
              <ChevronRightIcon color={theme.text} size={9} />
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {WEEKDAYS.map(day => (
              <Text
                key={day}
                style={[styles.weekday, {color: theme.textMuted}]}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.dayGrid}>
            {cells.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              const date = new Date(year, month, day);
              const disabled = startOfDay(date) > today;
              const isSelected =
                selected?.getFullYear() === year &&
                selected.getMonth() === month &&
                selected.getDate() === day;
              const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;
              return (
                <Pressable
                  key={date.toISOString()}
                  disabled={disabled}
                  onPress={() => {
                    onChange(formatDateValue(date));
                    setOpen(false);
                  }}
                  style={[
                    styles.dayCell,
                    isSelected && {
                      backgroundColor: theme.primary,
                      borderRadius: 18,
                    },
                    !isSelected && isToday && {
                      borderWidth: 1,
                      borderColor: theme.primary,
                      borderRadius: 18,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: disabled
                          ? theme.textMuted
                          : isSelected
                            ? theme.onPrimary
                            : theme.text,
                        opacity: disabled ? 0.4 : 1,
                      },
                    ]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </PickerSheet>
    </View>
  );
}

export function TimeField({
  theme,
  label,
  required,
  error,
  hint,
  flex,
  value,
  onChange,
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = parseTimeValue(value);
  const [hour12, setHour12] = useState(current.hour12);
  const [minute, setMinute] = useState(current.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(current.period);

  const openPicker = () => {
    const next = parseTimeValue(value);
    setHour12(next.hour12);
    setMinute(next.minute);
    setPeriod(next.period);
    setOpen(true);
  };

  return (
    <View style={[styles.field, flex && styles.flexField]}>
      <FieldLabel theme={theme} label={label} required={required} />
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.input,
          styles.select,
          {
            backgroundColor: theme.input,
            borderColor: borderColor(theme, error),
          },
        ]}>
        <ClockMiniIcon color={value ? theme.primary : theme.textMuted} size={15} />
        <Text
          style={[
            styles.selectValue,
            {color: value ? theme.text : theme.textMuted},
          ]}>
          {formatTimeLabel(value) || 'Select time'}
        </Text>
        <ChevronDownIcon color={theme.textMuted} size={8} />
      </Pressable>
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
      <PickerSheet
        theme={theme}
        visible={open}
        title={label}
        onClose={() => setOpen(false)}>
        <View style={styles.timeWrap}>
          <TimeColumn
            theme={theme}
            title="Hour"
            values={Array.from({length: 12}, (_, index) => String(index + 1))}
            selected={String(hour12)}
            onSelect={next => setHour12(Number(next))}
          />
          <TimeColumn
            theme={theme}
            title="Min"
            values={Array.from({length: 60}, (_, index) =>
              String(index).padStart(2, '0'),
            )}
            selected={String(minute).padStart(2, '0')}
            onSelect={next => setMinute(Number(next))}
          />
          <TimeColumn
            theme={theme}
            title="AM/PM"
            values={['AM', 'PM']}
            selected={period}
            onSelect={next => setPeriod(next as 'AM' | 'PM')}
          />
        </View>
        <Pressable
          onPress={() => {
            onChange(formatTimeValue(hour12, minute, period));
            setOpen(false);
          }}
          style={[styles.timeDone, {backgroundColor: theme.primary}]}>
          <Text style={[styles.timeDoneText, {color: theme.onPrimary}]}>
            Set time
          </Text>
        </Pressable>
      </PickerSheet>
    </View>
  );
}

function TimeColumn({
  theme,
  title,
  values,
  selected,
  onSelect,
}: {
  theme: ClaimPortalTheme;
  title: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.timeColumn}>
      <Text style={[styles.timeHeading, {color: theme.textMuted}]}>{title}</Text>
      <ScrollView style={styles.timeList} nestedScrollEnabled>
        {values.map(item => {
          const active = item === selected;
          return (
            <Pressable
              key={item}
              onPress={() => onSelect(item)}
              style={[
                styles.timeItem,
                active && {backgroundColor: theme.primary},
              ]}>
              <Text
                style={[
                  styles.timeItemText,
                  {color: active ? theme.onPrimary : theme.text},
                ]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function PickerSheet({
  theme,
  visible,
  title,
  onClose,
  children,
}: {
  theme: ClaimPortalTheme;
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.pickerRoot}>
        <Pressable
          style={[StyleSheet.absoluteFill, {backgroundColor: theme.overlay}]}
          onPress={onClose}
        />
        <View
          style={[
            styles.picker,
            {backgroundColor: theme.sheet, borderColor: theme.border},
          ]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, {color: theme.text}]}>{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={[styles.pickerClose, {backgroundColor: theme.chip}]}>
              <CloseIcon color={theme.text} size={12} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexField: {
    flex: 1,
    minWidth: 0,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
  },
  asterisk: {
    color: '#E11D48',
    fontWeight: '800',
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  area: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#E11D48',
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prefix: {
    minHeight: 48,
    minWidth: 86,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  prefixText: {
    fontSize: 13,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  pickerRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  picker: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: 18,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  pickerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  pickerList: {
    paddingHorizontal: 8,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 18,
    fontSize: 13,
  },
  pickerItem: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  calendar: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    height: 220,
  },
  timeColumn: {
    flex: 1,
  },
  timeHeading: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  timeList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeItem: {
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeItemText: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeDone: {
    marginHorizontal: 16,
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDoneText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
