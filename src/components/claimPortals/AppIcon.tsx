import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

type AppIconProps = {
  size?: number;
};

const appIconSource = require('../../../assets/app-icon.png');

export function AppIcon({size = 36}: AppIconProps) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
      ]}>
      <Image
        source={appIconSource}
        style={{width: size, height: size}}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});
