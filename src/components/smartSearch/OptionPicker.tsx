import React from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import type {SearchOption} from '../../types/smartSearch';

type OptionPickerProps = {
  visible: boolean;
  title: string;
  theme: ClaimPortalTheme;
  options: SearchOption[];
  selectedId?: string;
  onClose: () => void;
  onSelect: (option: SearchOption) => void;
};

export function OptionPicker({
  visible,
  title,
  theme,
  options,
  selectedId,
  onClose,
  onSelect,
}: OptionPickerProps) {
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
          accessibilityLabel="Close picker"
        />
        <View
          style={[
            styles.sheet,
            {backgroundColor: theme.sheet, borderColor: theme.border},
          ]}>
          <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {options.map(option => {
              const selected = option.id === selectedId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected ? theme.chip : theme.card,
                      borderColor: selected ? theme.primary : theme.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      {color: selected ? theme.primary : theme.text},
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
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
    maxHeight: '62%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
