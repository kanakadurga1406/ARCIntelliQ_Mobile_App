import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {
  DashboardTabIcon,
  GridTabIcon,
  HomeTabIcon,
  PlusMiniIcon,
  ProfileTabIcon,
} from './ClaimPortalsIcons';

export type MainTab = 'home' | 'portals' | 'dashboard' | 'profile';

type TabItem = {
  id: MainTab;
  label: string;
  Icon: React.ComponentType<{color?: string; size?: number}>;
};

const LEFT_TABS: TabItem[] = [
  {id: 'home', label: 'Home', Icon: HomeTabIcon},
  {id: 'portals', label: 'Claim Portals', Icon: GridTabIcon},
];

const RIGHT_TABS: TabItem[] = [
  {id: 'dashboard', label: 'Dashboard', Icon: DashboardTabIcon},
  {id: 'profile', label: 'Profile', Icon: ProfileTabIcon},
];

type BottomTabBarProps = {
  theme: ClaimPortalTheme;
  activeTab: MainTab;
  bottomInset: number;
  onChange: (tab: MainTab) => void;
  onAddClaim: () => void;
};

function TabButton({
  tab,
  active,
  color,
  onPress,
}: {
  tab: TabItem;
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
      <tab.Icon color={color} />
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
  activeTab,
  bottomInset,
  onChange,
  onAddClaim,
}: BottomTabBarProps) {
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
      {LEFT_TABS.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <TabButton
            key={tab.id}
            tab={tab}
            active={isActive}
            color={isActive ? theme.primary : theme.textMuted}
            onPress={() => onChange(tab.id)}
          />
        );
      })}

      <View style={styles.fabSlot}>
        <Pressable
          onPress={onAddClaim}
          accessibilityRole="button"
          accessibilityLabel="Add claim"
          style={({pressed}) => [styles.fabPress, pressed && {opacity: 0.88}]}>
          <LinearGradient
            colors={['#3C8CFF', '#1E5EFF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.fab}>
            <PlusMiniIcon color="#FFFFFF" size={22} />
          </LinearGradient>
        </Pressable>
        <Text style={[styles.fabLabel, {color: theme.textMuted}]}>Add Claim</Text>
      </View>

      {RIGHT_TABS.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <TabButton
            key={tab.id}
            tab={tab}
            active={isActive}
            color={isActive ? theme.primary : theme.textMuted}
            onPress={() => onChange(tab.id)}
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
