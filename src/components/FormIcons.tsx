import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../theme';

export function EnvelopeIcon() {
  return (
    <View style={styles.mailBox}>
      <View style={styles.mailBody}>
        <View style={styles.mailFlap} />
      </View>
    </View>
  );
}

export function LockIcon() {
  return (
    <View style={styles.lockBox}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody} />
    </View>
  );
}

export function EyeOffIcon() {
  return (
    <View style={styles.eyeBox}>
      <View style={styles.eyeOuter}>
        <View style={styles.eyePupil} />
      </View>
      <View style={styles.eyeSlash} />
    </View>
  );
}

export function EyeIcon() {
  return (
    <View style={styles.eyeBox}>
      <View style={styles.eyeOuter}>
        <View style={styles.eyePupil} />
      </View>
    </View>
  );
}

export function ShieldIcon() {
  return (
    <View style={styles.shield}>
      <View style={styles.shieldCheck} />
    </View>
  );
}

export function RecoveryShieldIcon() {
  return (
    <View style={styles.recoveryShield}>
      <View style={styles.recoveryKeyhole} />
    </View>
  );
}

const styles = StyleSheet.create({
  mailBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mailBody: {
    width: 16,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    overflow: 'hidden',
  },
  mailFlap: {
    width: 12,
    height: 12,
    marginTop: -7,
    marginLeft: 1,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.textMuted,
    transform: [{rotate: '-45deg'}],
  },
  lockBox: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lockShackle: {
    width: 8,
    height: 6,
    borderWidth: 1.6,
    borderBottomWidth: 0,
    borderColor: colors.textMuted,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  lockBody: {
    width: 12,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  eyeBox: {
    width: 20,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    width: 16,
    height: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  eyeSlash: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.textMuted,
    transform: [{rotate: '-28deg'}],
  },
  shield: {
    width: 16,
    height: 18,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldCheck: {
    width: 6,
    height: 4,
    marginTop: -1,
    borderLeftWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: colors.onPrimary,
    transform: [{rotate: '-45deg'}],
  },
  recoveryShield: {
    width: 28,
    height: 32,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryKeyhole: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.onPrimary,
  },
});
