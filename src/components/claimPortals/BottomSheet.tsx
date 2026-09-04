import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {CloseIcon} from './ClaimPortalsIcons';

type BottomSheetProps = {
  visible: boolean;
  title: string;
  theme: ClaimPortalTheme;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function BottomSheet({
  visible,
  title,
  theme,
  onClose,
  children,
  contentStyle,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, {backgroundColor: theme.overlay}]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        />
        <View
          style={[
            styles.sheet,
            {backgroundColor: theme.sheet, borderColor: theme.border},
            contentStyle,
          ]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
              style={[styles.close, {backgroundColor: theme.chip}]}>
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
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    borderWidth: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9D3E0',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
