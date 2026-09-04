import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../theme';

type ChevronIconProps = {
  color?: string;
  size?: number;
};

export function BriefcaseIcon() {
  return (
    <View style={styles.canvas}>
      <View style={styles.caseHandle} />
      <View style={styles.caseBody}>
        <View style={styles.caseLatch} />
      </View>
    </View>
  );
}

export function PersonIcon() {
  return (
    <View style={styles.canvas}>
      <View style={styles.head} />
      <View style={styles.body} />
    </View>
  );
}

export function HardHatIcon() {
  return (
    <View style={styles.canvas}>
      <View style={styles.hatTop} />
      <View style={styles.hatBrim} />
    </View>
  );
}

export function ChevronIcon({
  color = colors.primaryDark,
  size = 8,
}: ChevronIconProps) {
  return (
    <View
      style={[
        styles.chevron,
        {
          width: size,
          height: size,
          borderColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseHandle: {
    width: 7,
    height: 4,
    borderWidth: 1.7,
    borderBottomWidth: 0,
    borderColor: colors.primaryMid,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  caseBody: {
    width: 16,
    height: 11,
    marginTop: 1,
    borderRadius: 2,
    backgroundColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseLatch: {
    width: 6,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.accentSofter,
  },
  head: {
    width: 7.5,
    height: 7.5,
    borderRadius: 4,
    backgroundColor: colors.primaryMid,
  },
  body: {
    width: 15,
    height: 8,
    marginTop: 1.5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.primaryMid,
  },
  hatTop: {
    width: 13,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.primaryMid,
  },
  hatBrim: {
    width: 18,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: colors.primaryMid,
    marginTop: 1.5,
  },
  chevron: {
    marginLeft: -1,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopRightRadius: 1,
    transform: [{rotate: '45deg'}],
  },
});
