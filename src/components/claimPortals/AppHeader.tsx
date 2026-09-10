import React, {useEffect, useRef} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {colors} from '../../theme/colors';
import {motion} from '../../theme/visual';
import {MenuIcon, QuestionIcon} from './ClaimPortalsIcons';

const wordmark = require('../../../assets/arcintelliq-logo.png');

type AppHeaderProps = {
  theme: ClaimPortalTheme;
  userName: string;
  onMenuPress: () => void;
  onFaqsPress: () => void;
  onProfilePress: () => void;
  topInset?: number;
};

function HeaderCircleButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (value: number) => {
    Animated.timing(scale, {
      toValue: value,
      duration: motion.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.92)}
      onPressOut={() => animate(1)}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}>
      <Animated.View style={[styles.circleButton, {transform: [{scale}]}]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function ProfilePersonIcon() {
  return (
    <View style={styles.person}>
      <View style={styles.personHead} />
      <View style={styles.personBody} />
    </View>
  );
}

export function AppHeader({
  userName,
  onMenuPress,
  onFaqsPress,
  onProfilePress,
  topInset = 0,
}: AppHeaderProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.base,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.base,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          paddingTop: topInset,
          opacity,
          transform: [{translateY}],
        },
      ]}>
      <LinearGradient
        colors={['#DCEEFF', '#EAF4FF', 'rgba(247,250,255,0)']}
        locations={[0, 0.62, 1]}
        start={{x: 0.15, y: 0}}
        end={{x: 0.9, y: 1}}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.waveLayer}>
        <View style={styles.waveLeft} />
        <View style={styles.waveCenter} />
        <View style={styles.waveRight} />
      </View>

      <View style={styles.row}>
        <HeaderCircleButton label="Open menu" onPress={onMenuPress}>
          <MenuIcon color={colors.navy} size={16} />
        </HeaderCircleButton>

        <View style={styles.brand}>
          <Image
            source={wordmark}
            style={styles.wordmark}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>SMARTER CLAIMS TOGETHER</Text>
        </View>

        <View style={styles.right}>
          <HeaderCircleButton label="Open FAQs" onPress={onFaqsPress}>
            <View style={styles.helpRing}>
              <QuestionIcon color={colors.navy} size={13} />
            </View>
          </HeaderCircleButton>
          <Pressable
            onPress={onProfilePress}
            accessibilityRole="button"
            accessibilityLabel={`Open profile for ${userName}`}
            style={({pressed}) => [
              styles.avatar,
              pressed && {transform: [{scale: 0.94}]},
            ]}>
            <ProfilePersonIcon />
            <View style={styles.statusDot} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    zIndex: 2,
  },
  waveLayer: {
    ...StyleSheet.absoluteFill,
  },
  waveLeft: {
    position: 'absolute',
    left: -70,
    bottom: -58,
    width: 210,
    height: 110,
    borderRadius: 110,
    backgroundColor: 'rgba(184, 214, 246, 0.28)',
  },
  waveCenter: {
    position: 'absolute',
    left: '28%',
    bottom: -72,
    width: 240,
    height: 120,
    borderRadius: 120,
    backgroundColor: 'rgba(210, 230, 252, 0.34)',
  },
  waveRight: {
    position: 'absolute',
    right: -80,
    bottom: -64,
    width: 220,
    height: 118,
    borderRadius: 110,
    backgroundColor: 'rgba(176, 208, 244, 0.22)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  wordmark: {
    width: 156,
    height: 24,
  },
  tagline: {
    marginTop: 3,
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: '700',
    color: colors.textMuted,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  person: {
    alignItems: 'center',
    marginTop: 2,
  },
  personHead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.onPrimary,
  },
  personBody: {
    width: 18,
    height: 11,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: colors.onPrimary,
    marginTop: 2,
  },
  statusDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
