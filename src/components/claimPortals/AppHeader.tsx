import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getInitials} from '../../theme/claimPortals';
import {MenuIcon, QuestionIcon} from './ClaimPortalsIcons';

const wordmark = require('../../../assets/arcintelliq-logo.png');

type AppHeaderProps = {
  theme: ClaimPortalTheme;
  userName: string;
  onMenuPress: () => void;
  onFaqsPress: () => void;
  onProfilePress: () => void;
};

export function AppHeader({
  theme,
  userName,
  onMenuPress,
  onFaqsPress,
  onProfilePress,
}: AppHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onMenuPress}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
        hitSlop={8}
        style={({pressed}) => [
          styles.iconButton,
          {backgroundColor: theme.card, borderColor: theme.border},
          pressed && {opacity: 0.8},
        ]}>
        <MenuIcon color={theme.text} />
      </Pressable>

      <View style={styles.brand}>
        <Image
          source={wordmark}
          style={styles.wordmark}
          resizeMode="contain"
        />
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={onFaqsPress}
          accessibilityRole="button"
          accessibilityLabel="Open FAQs"
          hitSlop={10}
          style={({pressed}) => [styles.plainIcon, pressed && {opacity: 0.7}]}>
          <QuestionIcon color={theme.text} size={18} />
        </Pressable>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={({pressed}) => [
            styles.avatar,
            {backgroundColor: theme.primary},
            pressed && {opacity: 0.85},
          ]}>
          <Text style={styles.avatarText}>{getInitials(userName)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  wordmark: {
    width: 148,
    height: 22,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10233F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
