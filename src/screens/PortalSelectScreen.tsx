import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BriefcaseIcon,
  ChevronIcon,
  HardHatIcon,
  PersonIcon,
} from '../components/PortalIcons';
import {FadeSlideIn, PressableScale} from '../components/ui/Motion';
import {colors} from '../theme';
import type {UserRole} from '../types/auth';
import type {PortalSelectScreenProps} from '../types/navigation';

type PortalId = UserRole;

type PortalOptionConfig = {
  id: PortalId;
  title: string;
  subtitle: string;
  Icon: React.ComponentType;
};

const PORTALS: PortalOptionConfig[] = [
  {
    id: 'claim-handler',
    title: 'Claim Handler Login',
    subtitle: 'For adjusters, administrators, and claims teams',
    Icon: BriefcaseIcon,
  },
  {
    id: 'claimant',
    title: 'Claimant Login',
    subtitle: 'View, complete, and follow your claim',
    Icon: PersonIcon,
  },
  {
    id: 'contractor',
    title: 'Contractor Login',
    subtitle: 'Manage assigned work and communications',
    Icon: HardHatIcon,
  },
];

function DotGrid() {
  return (
    <View style={styles.dotGrid} pointerEvents="none">
      {Array.from({length: 20}).map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
    </View>
  );
}

type PortalOptionProps = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType;
  onPress: () => void;
};

function PortalOption({title, subtitle, Icon, onPress}: PortalOptionProps) {
  return (
    <FadeSlideIn>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        android_ripple={{color: colors.accentSoft}}
        contentStyle={styles.card}>
        <View style={styles.iconBadge}>
          <Icon />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.arrowButton}>
          <ChevronIcon />
        </View>
      </PressableScale>
    </FadeSlideIn>
  );
}

const PortalSelectScreen = ({navigation}: PortalSelectScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topWave} pointerEvents="none" />
      <View style={styles.topWaveSoft} pointerEvents="none" />
      <DotGrid />
      <View style={styles.bottomWave} pointerEvents="none" />
      <View style={styles.bottomWaveSoft} pointerEvents="none" />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 28,
          },
        ]}>
        <View style={styles.brandBlock}>
          <Image
            source={require('../../assets/arcintelliq-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>SMARTER CLAIMS TOGETHER</Text>
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.title}>Where would you like to go</Text>
        </View>

        <View style={styles.list}>
          {PORTALS.map(portal => (
            <PortalOption
              key={portal.id}
              title={portal.title}
              subtitle={portal.subtitle}
              Icon={portal.Icon}
              onPress={() => {
                if (portal.id === 'claim-handler') {
                  navigation.navigate('ClaimHandlerLogin');
                }
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default PortalSelectScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topWave: {
    position: 'absolute',
    top: -90,
    left: -120,
    width: 320,
    height: 220,
    borderRadius: 160,
    backgroundColor: colors.wave,
    transform: [{rotate: '-12deg'}],
  },
  topWaveSoft: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: 220,
    height: 140,
    borderRadius: 90,
    backgroundColor: colors.waveSoft,
  },
  bottomWave: {
    position: 'absolute',
    right: -80,
    bottom: -110,
    width: 380,
    height: 210,
    borderRadius: 140,
    backgroundColor: colors.waveBottom,
    transform: [{rotate: '-8deg'}],
  },
  bottomWaveSoft: {
    position: 'absolute',
    left: -40,
    bottom: -70,
    width: 240,
    height: 140,
    borderRadius: 80,
    backgroundColor: colors.waveBottomSoft,
  },
  dotGrid: {
    position: 'absolute',
    top: 58,
    right: 22,
    width: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.dot,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 36,
  },
  brandLogo: {
    width: 220,
    height: 28,
  },
  tagline: {
    marginTop: 10,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.textMuted,
    fontWeight: '600',
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingLeft: 14,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
