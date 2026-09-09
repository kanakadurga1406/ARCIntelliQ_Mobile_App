import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {motion} from '../../theme/visual';

type FadeSlideInProps = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function FadeSlideIn({
  children,
  delay = 0,
  distance = 10,
  duration = motion.base,
  style,
}: FadeSlideInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[style, {opacity, transform: [{translateY}]}]}>
      {children}
    </Animated.View>
  );
}

type PressableScaleProps = PressableProps & {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

export function PressableScale({
  children,
  contentStyle,
  pressedScale = 0.975,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.timing(scale, {
      toValue: value,
      duration: motion.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      {...rest}
      onPressIn={event => {
        animateTo(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={style}>
      <Animated.View style={[contentStyle, {transform: [{scale}]}]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
