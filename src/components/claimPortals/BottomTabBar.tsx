import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {NavItem} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {UiIcon} from './UiIcon';

type BottomTabBarProps = {
  theme: ClaimPortalTheme;
  tabs: NavItem[];
  activeTab: string;
  bottomInset: number;
  onDestination: (destination: string) => void;
};

function TabButton({
  tab,
  active,
  color,
  onPress,
}: {
  tab: NavItem;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{selected: active}}
      accessibilityLabel={tab.label}
      style={styles.tab}>
      <UiIcon name={tab.icon} color={color} />
      <Text
        style={[styles.label, {color}, active && styles.labelActive]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

export function BottomTabBar({
  theme,
  tabs,
  activeTab,
  bottomInset,
  onDestination,
}: BottomTabBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          paddingBottom: Math.max(bottomInset, 8),
        },
      ]}>
      {tabs.map(tab => {
        if (tab.style === 'fab') {
          return (
            <View key={tab.id} style={styles.fabSlot}>
              <Pressable
                onPress={() => onDestination(tab.destination)}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                style={({pressed}) => [styles.fabPress, pressed && {opacity: 0.88}]}>
                <LinearGradient
                  colors={['#3C8CFF', '#1E5EFF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.fab}>
                  <UiIcon name={tab.icon} color="#FFFFFF" size={22} />
                </LinearGradient>
              </Pressable>
              <Text style={[styles.fabLabel, {color: theme.textMuted}]}>
                {tab.label}
              </Text>
            </View>
          );
        }

        const isActive = tab.destination === activeTab || tab.id === activeTab;
        return (
          <TabButton
            key={tab.id}
            tab={tab}
            active={isActive}
            color={isActive ? theme.primary : theme.textMuted}
            onPress={() => onDestination(tab.destination)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 4,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minHeight: 48,
    paddingBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: '800',
  },
  fabSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -22,
  },
  fabPress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E5EFF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  fabLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
