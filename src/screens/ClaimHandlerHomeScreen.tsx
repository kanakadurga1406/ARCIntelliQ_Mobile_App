import React, {useMemo} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {clearSession} from '../api/session';
import {AppHeader} from '../components/claimPortals/AppHeader';
import {PageBackdrop} from '../components/claimPortals/PageBackdrop';
import {PageHero} from '../components/claimPortals/PageHero';
import {getClaimPortalTheme} from '../theme/claimPortals';
import {colors} from '../theme';
import type {ClaimHandlerHomeScreenProps} from '../types/navigation';

const ClaimHandlerHomeScreen = ({
  navigation,
  route,
}: ClaimHandlerHomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const theme = useMemo(() => getClaimPortalTheme('light'), []);
  const user = route.params.user;

  const signOut = () => {
    clearSession();
    navigation.reset({
      index: 0,
      routes: [{name: 'PortalSelect'}],
    });
  };

  return (
    <View style={styles.root}>
      <PageBackdrop />
      <StatusBar barStyle="dark-content" />
      <AppHeader
        theme={theme}
        userName={user.name}
        topInset={insets.top}
        onMenuPress={() =>
          navigation.navigate('ClaimPortals', {user, initialTab: 'portals'})
        }
        onFaqsPress={() => navigation.navigate('Faqs')}
        onProfilePress={() =>
          navigation.navigate('ClaimPortals', {user, initialTab: 'profile'})
        }
      />
      <View style={styles.body}>
        <PageHero
          icon="users"
          title={`Welcome, ${user.name || 'Handler'}`}
          subtitle={user.title || 'Claim Handler'}
        />
        <Text style={styles.email}>{user.email}</Text>
        <Pressable
          onPress={signOut}
          style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ClaimHandlerHomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
  },
  button: {
    marginTop: 28,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});
