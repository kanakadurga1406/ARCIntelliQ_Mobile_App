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
import {ChevronDownIcon, CloseIcon} from './ClaimPortalsIcons';

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
  onChangeText,
  hint,
  onFocus,
}: FieldProps & {
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <FieldLabel theme={theme} label={label} required={required} />
      <View style={styles.phoneRow}>
        <View
          style={[
            styles.prefix,
            {backgroundColor: theme.input, borderColor: borderColor(theme, error)},
          ]}>
          <Text style={[styles.prefixText, {color: theme.text}]}>US +1</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={text => onChangeText(text.replace(/[^\d]/g, '').slice(0, 10))}
          placeholder="5551234567"
          placeholderTextColor={theme.textMuted}
          keyboardType="phone-pad"
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
  onChange,
}: FieldProps & {
  value: string;
  options: readonly string[];
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
          {value || 'Select'}
        </Text>
        <ChevronDownIcon color={theme.textMuted} size={8} />
      </Pressable>
      <FieldError theme={theme} error={error} />
      {!error && hint ? (
        <Text style={[styles.hint, {color: theme.textMuted}]}>{hint}</Text>
      ) : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.pickerRoot}>
          <Pressable
            style={[StyleSheet.absoluteFill, {backgroundColor: theme.overlay}]}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              styles.picker,
              {backgroundColor: theme.sheet, borderColor: theme.border},
            ]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, {color: theme.text}]}>{label}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={8}
                style={[styles.pickerClose, {backgroundColor: theme.chip}]}>
                <CloseIcon color={theme.text} size={12} />
              </Pressable>
            </View>
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
                      selected && {backgroundColor: theme.cardMuted},
                    ]}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        {color: selected ? theme.primary : theme.text},
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
          </View>
        </View>
      </Modal>
    </View>
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
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});
