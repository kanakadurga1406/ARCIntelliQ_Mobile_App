import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import type {ClaimFormField} from '../../types/claimDetail';
import {
  CalendarIcon,
  ChevronDownIcon,
  ClockMiniIcon,
  CopyMiniIcon,
} from '../claimPortals/ClaimPortalsIcons';

type FieldProps = {
  theme: ClaimPortalTheme;
  field: ClaimFormField;
  value: string;
  onChange: (value: string) => void;
};

const INPUT_BG = '#F4F8FF';

function blank(value: string): string {
  return !value || value === '—' ? '' : value;
}

export function ClaimFormInput({theme, field, value, onChange}: FieldProps) {
  const shown = blank(value);
  const isSelect = field.kind === 'select';
  const isArea = field.kind === 'textarea';

  return (
    <View style={[styles.wrap, field.span === 'full' && styles.full]}>
      <Text style={[styles.label, {color: theme.textSecondary}]}>
        {field.label}
        {field.required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {isSelect ? (
        <View
          style={[
            styles.input,
            styles.select,
            {borderColor: theme.border, backgroundColor: theme.input},
          ]}>
          <Text
            style={[
              styles.inputText,
              {color: shown ? theme.text : theme.textMuted},
            ]}
            numberOfLines={1}>
            {shown || 'Select'}
          </Text>
          <ChevronDownIcon color={theme.textMuted} size={12} />
        </View>
      ) : (
        <View
          style={[
            styles.input,
            isArea && styles.area,
            {borderColor: theme.border, backgroundColor: theme.input},
          ]}>
          <TextInput
            value={shown}
            onChangeText={onChange}
            placeholder={field.kind === 'select' ? 'Select' : ''}
            placeholderTextColor={theme.textMuted}
            multiline={isArea}
            style={[
              styles.inputText,
              isArea && styles.areaText,
              {color: theme.text},
            ]}
          />
          {field.copyable ? (
            <CopyMiniIcon color={theme.textMuted} size={14} />
          ) : null}
          {field.kind === 'date' ? (
            <CalendarIcon color={theme.textMuted} size={14} />
          ) : null}
          {field.kind === 'time' ? (
            <ClockMiniIcon color={theme.textMuted} size={14} />
          ) : null}
        </View>
      )}
      {field.helper ? (
        <Text style={[styles.helper, {color: theme.textMuted}]}>
          {field.helper}
        </Text>
      ) : null}
    </View>
  );
}

type TriageProps = {
  theme: ClaimPortalTheme;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TriageRow({theme, label, value, onChange}: TriageProps) {
  const options = ['Yes', 'No', 'Unknown'];
  return (
    <View style={[styles.triage, {borderColor: theme.border}]}>
      <Text style={[styles.triageLabel, {color: theme.text}]}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.triageOptions}>
        {options.map(option => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={({pressed}) => [
                styles.triageOption,
                pressed && {opacity: 0.75},
              ]}>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: active ? theme.primary : theme.border,
                    backgroundColor: active ? theme.primary : theme.card,
                  },
                ]}>
                {active ? (
                  <View
                    style={[styles.radioDot, {backgroundColor: theme.onPrimary}]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  styles.triageOptionText,
                  {color: active ? theme.primary : theme.textSecondary},
                ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '48%',
    marginBottom: 12,
  },
  full: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  select: {
    justifyContent: 'space-between',
  },
  area: {
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
  },
  areaText: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  helper: {
    marginTop: 4,
    fontSize: 11,
  },
  triage: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  triageLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  triageOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  triageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  triageOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
