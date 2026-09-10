import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {colors} from '../../theme';
import {ChevronIcon} from '../PortalIcons';

type LoginStyleBackButtonProps = {
  onPress: () => void;
  label?: string;
};

export function LoginStyleBackButton({
  onPress,
  label = 'Back',
}: LoginStyleBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({pressed}) => [
        styles.backButton,
        pressed && styles.backButtonPressed,
      ]}>
      <View style={styles.backChevron}>
        <ChevronIcon color={colors.primaryDark} size={8} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  backChevron: {
    transform: [{rotate: '180deg'}],
  },
});
