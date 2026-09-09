import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {colors} from '../../theme/colors';
import {motion, shadows} from '../../theme/visual';
import {ChevronDownIcon} from '../claimPortals/ClaimPortalsIcons';
import {UiIcon} from '../claimPortals/UiIcon';
import {FadeSlideIn} from '../ui/Motion';

type ClaimAccordionCardProps = {
  theme: ClaimPortalTheme;
  title: string;
  subtitle: string;
  icon: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

export function ClaimAccordionCard({
  theme,
  title,
  subtitle,
  icon,
  open,
  onToggle,
  children,
}: ClaimAccordionCardProps) {
  const rotate = useRef(new Animated.Value(open ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: open ? 1 : 0,
      duration: motion.base,
      useNativeDriver: true,
    }).start();
  }, [open, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <FadeSlideIn>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: open ? colors.accentSofter : theme.border,
            shadowColor: theme.shadow,
          },
        ]}>
        <Pressable
          onPress={onToggle}
          onPressIn={() =>
            Animated.timing(iconScale, {
              toValue: 0.92,
              duration: motion.fast,
              useNativeDriver: true,
            }).start()
          }
          onPressOut={() =>
            Animated.timing(iconScale, {
              toValue: 1,
              duration: motion.fast,
              useNativeDriver: true,
            }).start()
          }
          accessibilityRole="button"
          accessibilityLabel={title}
          style={styles.header}>
          <Animated.View style={[styles.iconWrap, {transform: [{scale: iconScale}]}]}>
            <UiIcon name={icon === 'pin' ? 'building' : icon} color={colors.primary} />
          </Animated.View>
          <View style={styles.copy}>
            <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
            <Text style={[styles.subtitle, {color: theme.textMuted}]}>
              {subtitle}
            </Text>
          </View>
          <Animated.View style={{transform: [{rotate: spin}]}}>
            <ChevronDownIcon color={theme.textMuted} size={14} />
          </Animated.View>
        </Pressable>
        {open ? <View style={styles.body}>{children}</View> : null}
      </View>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
