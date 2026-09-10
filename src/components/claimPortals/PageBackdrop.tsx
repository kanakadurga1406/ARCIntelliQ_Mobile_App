import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export function PageBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#DCEEFF', '#EAF4FF', '#F3F8FF', '#F7FAFF']}
        locations={[0, 0.22, 0.58, 1]}
        start={{x: 0.1, y: 0}}
        end={{x: 0.9, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blobTop} />
      <View style={styles.blobMid} />
      <View style={styles.blobRight} />
      <View style={styles.blobBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  blobTop: {
    position: 'absolute',
    top: -40,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(91, 156, 255, 0.16)',
  },
  blobMid: {
    position: 'absolute',
    top: 180,
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(160, 205, 255, 0.18)',
  },
  blobRight: {
    position: 'absolute',
    top: 420,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 92, 246, 0.08)',
  },
  blobBottom: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43, 116, 255, 0.07)',
  },
});
