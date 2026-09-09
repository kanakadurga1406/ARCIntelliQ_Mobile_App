import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme/colors';
import {
  BriefcaseMiniIcon,
  BuildingIcon,
  DocumentIcon,
  QuestionIcon,
  SparkleIcon,
  UsersMiniIcon,
} from './ClaimPortalsIcons';

type PageHeroIcon =
  | 'building'
  | 'users'
  | 'briefcase'
  | 'document'
  | 'search'
  | 'faq';

type PageHeroProps = {
  title: string;
  subtitle?: string;
  icon?: PageHeroIcon;
};

function HeroGlyph({icon}: {icon: PageHeroIcon}) {
  const color = colors.primary;
  if (icon === 'users') {
    return <UsersMiniIcon color={color} size={20} />;
  }
  if (icon === 'briefcase') {
    return <BriefcaseMiniIcon color={color} size={20} />;
  }
  if (icon === 'document') {
    return <DocumentIcon color={color} size={20} />;
  }
  if (icon === 'search') {
    return <SparkleIcon color={color} size={20} />;
  }
  if (icon === 'faq') {
    return <QuestionIcon color={color} size={18} />;
  }
  return <BuildingIcon color={color} size={22} />;
}

function Skyline() {
  return (
    <View style={styles.skyline} pointerEvents="none">
      <View style={[styles.tower, styles.towerA]} />
      <View style={[styles.tower, styles.towerB]} />
      <View style={[styles.tower, styles.towerC]} />
      <View style={[styles.tower, styles.towerD]} />
      <View style={[styles.tower, styles.towerE]} />
      <View style={styles.dome} />
    </View>
  );
}

export function PageHero({
  title,
  subtitle,
  icon = 'building',
}: PageHeroProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconTile}>
        <HeroGlyph icon={icon} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Skyline />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 72,
    overflow: 'hidden',
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DCECFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  skyline: {
    position: 'absolute',
    right: -6,
    bottom: 2,
    width: 118,
    height: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    opacity: 0.28,
  },
  tower: {
    backgroundColor: '#7EB3F5',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  towerA: {
    width: 16,
    height: 36,
  },
  towerB: {
    width: 22,
    height: 52,
  },
  towerC: {
    width: 14,
    height: 28,
  },
  towerD: {
    width: 20,
    height: 44,
  },
  towerE: {
    width: 12,
    height: 22,
  },
  dome: {
    position: 'absolute',
    right: 28,
    top: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#9CC4F5',
  },
});
