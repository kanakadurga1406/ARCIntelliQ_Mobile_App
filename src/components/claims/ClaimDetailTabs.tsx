import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {motion} from '../../theme/visual';
import type {ClaimDetailTab, ClaimDetailTabId} from '../../types/claimDetail';

type ClaimDetailTabsProps = {
  theme: ClaimPortalTheme;
  tabs: ClaimDetailTab[];
  active: ClaimDetailTabId;
  onChange: (id: ClaimDetailTabId) => void;
};

const BUCKET_WIDTH = 96;
const BUCKET_GAP = 12;

function BucketIcon({name, color}: {name: string; color: string}) {
  if (name === 'pin') {
    return (
      <View style={[styles.plate, {backgroundColor: `${color}1A`}]}>
        <View style={[styles.pinHead, {borderColor: color}]}>
          <View style={[styles.pinCore, {backgroundColor: color}]} />
        </View>
        <View style={[styles.pinPoint, {borderTopColor: color}]} />
      </View>
    );
  }
  if (name === 'users') {
    return (
      <View style={[styles.plate, {backgroundColor: `${color}1A`}]}>
        <View style={styles.people}>
          <View style={[styles.person, {opacity: 0.45}]}>
            <View style={[styles.head, {backgroundColor: color}]} />
            <View style={[styles.body, {backgroundColor: color}]} />
          </View>
          <View style={styles.person}>
            <View style={[styles.head, {backgroundColor: color}]} />
            <View style={[styles.body, {backgroundColor: color}]} />
          </View>
        </View>
      </View>
    );
  }
  if (name === 'dollar') {
    return (
      <View style={[styles.plate, {backgroundColor: `${color}1A`}]}>
        <View style={[styles.coin, {borderColor: color}]}>
          <Text style={[styles.coinMark, {color}]}>$</Text>
        </View>
      </View>
    );
  }
  if (name === 'notes') {
    return (
      <View style={[styles.plate, {backgroundColor: `${color}1A`}]}>
        <View style={[styles.pad, {borderColor: color}]}>
          <View style={[styles.rule, {backgroundColor: color}]} />
          <View style={[styles.rule, {backgroundColor: color, width: 14}]} />
          <View style={[styles.rule, {backgroundColor: color, width: 10}]} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.plate, {backgroundColor: `${color}1A`}]}>
      <View style={[styles.file, {borderColor: color}]}>
        <View style={[styles.fold, {borderBottomColor: color}]} />
        <View style={[styles.rule, {backgroundColor: color, marginTop: 10}]} />
        <View style={[styles.rule, {backgroundColor: color, width: 12}]} />
      </View>
    </View>
  );
}

function TabBucket({
  theme,
  tab,
  selected,
  onPress,
}: {
  theme: ClaimPortalTheme;
  tab: ClaimDetailTab;
  selected: boolean;
  onPress: () => void;
}) {
  const lift = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(selected ? 1.06 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(lift, {
        toValue: selected ? 1 : 0,
        duration: motion.base,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: selected ? 1.08 : 1,
        duration: motion.base,
        useNativeDriver: true,
      }),
    ]).start();
  }, [iconScale, lift, selected]);

  const translateY = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{selected}}
      accessibilityLabel={tab.label}>
      <Animated.View
        style={[
          styles.bucket,
          {
            backgroundColor: theme.card,
            borderColor: selected ? theme.primary : theme.border,
            shadowColor: theme.shadow,
            transform: [{translateY}],
          },
          selected && styles.bucketSelected,
        ]}>
        <View style={[styles.wash, {backgroundColor: tab.background}]} />
        <Animated.View style={{transform: [{scale: iconScale}]}}>
          <BucketIcon name={tab.icon} color={tab.foreground} />
        </Animated.View>
        <Text
          style={[
            styles.label,
            {color: selected ? theme.primary : theme.text},
          ]}
          numberOfLines={1}>
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function ClaimDetailTabs({
  theme,
  tabs,
  active,
  onChange,
}: ClaimDetailTabsProps) {
  return (
    <View style={styles.shelf}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={BUCKET_WIDTH + BUCKET_GAP}
        snapToAlignment="start"
        contentContainerStyle={styles.row}>
        {tabs.map(tab => (
          <TabBucket
            key={tab.id}
            theme={theme}
            tab={tab}
            selected={tab.id === active}
            onPress={() => onChange(tab.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    marginTop: 4,
  },
  row: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: BUCKET_GAP,
  },
  bucket: {
    width: BUCKET_WIDTH,
    height: 108,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    overflow: 'hidden',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bucketSelected: {
    height: 116,
    transform: [{translateY: -4}],
    elevation: 6,
    shadowOpacity: 0.14,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 58,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  plate: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  file: {
    width: 26,
    height: 30,
    borderWidth: 2.5,
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 5,
  },
  fold: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
  },
  pinHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  people: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  person: {
    alignItems: 'center',
  },
  head: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  body: {
    width: 16,
    height: 11,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 2,
  },
  coin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinMark: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: -1,
  },
  pad: {
    width: 24,
    height: 28,
    borderWidth: 2.5,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingTop: 7,
    gap: 3,
  },
  rule: {
    height: 2.5,
    borderRadius: 1,
    width: 16,
  },
});
