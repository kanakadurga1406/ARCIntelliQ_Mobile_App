import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {ClaimHandlerUser} from '../../types/auth';
import type {NavItem} from '../../types/claimPortals';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import {getInitials} from '../../theme/claimPortals';
import {AppIcon} from './AppIcon';
import {CloseIcon, LogoutMiniIcon} from './ClaimPortalsIcons';
import {UiIcon} from './UiIcon';

type SideDrawerProps = {
  visible: boolean;
  theme: ClaimPortalTheme;
  user: ClaimHandlerUser;
  menuItems: NavItem[];
  activeDestination: string | null;
  topInset: number;
  bottomInset: number;
  portalName?: string;
  onClose: () => void;
  onNavigate: (destination: string, label?: string) => void;
};

export function SideDrawer({
  visible,
  theme,
  user,
  menuItems,
  activeDestination,
  topInset,
  bottomInset,
  portalName,
  onClose,
  onNavigate,
}: SideDrawerProps) {
  const {width, height} = useWindowDimensions();
  const drawerWidth = Math.min(Math.max(width * 0.82, 280), 360);
  const progress = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
    }
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished && !visible) {
        setRendered(false);
      }
    });
  }, [visible, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  if (!rendered) {
    return null;
  }

  return (
    <View style={[styles.overlay, {width, height}]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close menu"
        onPress={onClose}
        style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.backdrop,
            {backgroundColor: theme.overlay, opacity: progress},
          ]}
        />
      </Pressable>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: theme.drawer,
            paddingTop: topInset + 12,
            paddingBottom: bottomInset + 16,
            transform: [{translateX}],
          },
        ]}>
        <View style={styles.header}>
          <AppIcon size={42} />
          <View style={styles.headerCopy}>
            <Text style={styles.profileNameTop} numberOfLines={1}>
              {user.name}
            </Text>
            {portalName ? (
              <Text style={styles.portalName} numberOfLines={1}>
                {portalName}
              </Text>
            ) : null}
            <Text style={styles.appName}>ARCintelliQ</Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            hitSlop={8}
            style={styles.closeButton}>
            <CloseIcon color={theme.drawerText} size={14} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menu}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MENU</Text>
            {menuItems
            .filter(
              item =>
                item.destination !== 'sign-out' &&
                item.id !== 'sign-out' &&
                item.label.toLowerCase() !== 'sign out',
            )
            .map(item => {
              const isActive = item.destination === activeDestination;
              const content = (
                <>
                  <UiIcon name={item.icon} color="#FFFFFF" size={16} />
                  <Text style={styles.itemLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {typeof item.badge === 'number' ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                </>
              );

              if (isActive) {
                return (
                  <LinearGradient
                    key={item.id}
                    colors={['#2B74FF', '#1E5EFF']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.activeItem}>
                    <Pressable
                      onPress={() => onNavigate(item.destination, item.label)}
                      style={styles.itemPress}>
                      {content}
                    </Pressable>
                  </LinearGradient>
                );
              }

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onNavigate(item.destination, item.label)}
                  style={({pressed}) => [
                    styles.item,
                    pressed && {backgroundColor: theme.drawerItem},
                  ]}>
                  {content}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Pressable
          onPress={() => onNavigate('profile')}
          style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.profileRole} numberOfLines={1}>
              {user.title}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => onNavigate('sign-out')}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={[styles.signOut, {backgroundColor: theme.signOutBg}]}>
          <LogoutMiniIcon />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 10,
  },
  profileNameTop: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  portalName: {
    marginTop: 2,
    color: '#D5DDE8',
    fontSize: 13,
    fontWeight: '600',
  },
  appName: {
    marginTop: 2,
    color: '#9AA8BB',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#7D8B9E',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  activeItem: {
    borderRadius: 12,
    marginBottom: 4,
  },
  itemPress: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    gap: 10,
  },
  itemLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2B74FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#243249',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2B74FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  profileCopy: {
    flex: 1,
    marginLeft: 10,
  },
  profileName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  profileRole: {
    color: '#9AA8BB',
    fontSize: 12,
    marginTop: 1,
  },
  signOut: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    color: '#F43F5E',
    fontSize: 15,
    fontWeight: '700',
  },
});
