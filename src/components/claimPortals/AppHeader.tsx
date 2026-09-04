import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getInitials} from '../../theme/claimPortals';
import {AppIcon} from './AppIcon';
import {MenuIcon, MoonIcon, SunIcon} from './ClaimPortalsIcons';

const wordmark = require('../../../assets/arcintelliq-logo.png');

type AppHeaderProps = {
  theme: ClaimPortalTheme;
  userName: string;
  onMenuPress: () => void;
  onThemePress: () => void;
  onProfilePress: () => void;
};

export function AppHeader({
  theme,
  userName,
  onMenuPress,
  onThemePress,
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
        <AppIcon size={28} />
        <Image
          source={wordmark}
          style={[
            styles.wordmark,
            theme.scheme === 'dark' && styles.wordmarkDark,
          ]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={onThemePress}
          accessibilityRole="button"
          accessibilityLabel={
            theme.scheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          hitSlop={8}
          style={({pressed}) => [
            styles.iconButton,
            {backgroundColor: theme.card, borderColor: theme.border},
            pressed && {opacity: 0.8},
          ]}>
          {theme.scheme === 'dark' ? (
            <SunIcon color={theme.gold} />
          ) : (
            <MoonIcon color={theme.text} cutColor={theme.card} />
          )}
        </Pressable>
        <Pressable
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          style={({pressed}) => [styles.avatar, pressed && {opacity: 0.85}]}>
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
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  wordmark: {
    width: 132,
    height: 18,
  },
  wordmarkDark: {
    tintColor: '#FFFFFF',
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
