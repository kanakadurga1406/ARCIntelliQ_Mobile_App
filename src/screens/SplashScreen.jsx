import React, {useEffect, useRef} from 'react';
import {View, Image, Animated, StyleSheet, Easing} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {colors, gradients} from '../theme';

const logoSource = require('../../assets/arcintelliq-logo.png');

const SplashScreen = ({navigation}) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let finishTimer;

    const startAnimation = async () => {
      await BootSplash.hide({fade: false});

      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          finishTimer = setTimeout(() => {
            Animated.timing(splashOpacity, {
              toValue: 0,
              duration: 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start(() => {
              navigation.replace('PortalSelect');
            });
          }, 350);
        });
      });
    };

    startAnimation();

    return () => {
      if (finishTimer) {
        clearTimeout(finishTimer);
      }
    };
  }, [logoOpacity, logoScale, shineAnim, splashOpacity, navigation]);

  const shineTranslateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 220],
  });

  return (
    <Animated.View style={[styles.container, {opacity: splashOpacity}]}>
      <View style={styles.topWave} pointerEvents="none" />
      <View style={styles.topWaveSoft} pointerEvents="none" />
      <View style={styles.bottomWave} pointerEvents="none" />
      <View style={styles.bottomWaveSoft} pointerEvents="none" />
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [{scale: logoScale}],
          },
        ]}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />

        <MaskedView
          style={styles.mask}
          maskElement={
            <View style={styles.maskFill}>
              <Image
                source={logoSource}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          }>
          <Animated.View
            style={[
              styles.shineBand,
              {
                transform: [{translateX: shineTranslateX}, {skewX: '-22deg'}],
              },
            ]}>
            <LinearGradient
              colors={gradients.splashShine}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.shine}
            />
          </Animated.View>
        </MaskedView>
      </Animated.View>
    </Animated.View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topWave: {
    position: 'absolute',
    top: -90,
    left: -120,
    width: 320,
    height: 220,
    borderRadius: 160,
    backgroundColor: colors.wave,
    transform: [{rotate: '-12deg'}],
  },
  topWaveSoft: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: 220,
    height: 140,
    borderRadius: 90,
    backgroundColor: colors.waveSoft,
  },
  bottomWave: {
    position: 'absolute',
    right: -80,
    bottom: -110,
    width: 380,
    height: 210,
    borderRadius: 140,
    backgroundColor: colors.waveBottom,
    transform: [{rotate: '-8deg'}],
  },
  bottomWaveSoft: {
    position: 'absolute',
    left: -40,
    bottom: -70,
    width: 240,
    height: 140,
    borderRadius: 80,
    backgroundColor: colors.waveBottomSoft,
  },
  logoWrap: {
    width: 260,
    height: 34,
    overflow: 'hidden',
  },
  logo: {
    width: 260,
    height: 34,
  },
  mask: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  maskFill: {
    flex: 1,
    backgroundColor: colors.transparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shineBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 48,
  },
  shine: {
    flex: 1,
  },
});
