import {colors} from './colors';

export type ThemeScheme = 'light' | 'dark';

export type ClaimPortalTheme = {
  scheme: ThemeScheme;
  page: string;
  card: string;
  cardMuted: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  input: string;
  chip: string;
  chipText: string;
  overlay: string;
  drawer: string;
  drawerText: string;
  drawerMuted: string;
  drawerSection: string;
  drawerItem: string;
  signOutBg: string;
  tabBar: string;
  sheet: string;
  shadow: string;
  primary: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  purple: string;
  purpleSoft: string;
  gold: string;
  goldSoft: string;
  orange: string;
};

export const avatarPalette = [
  '#6D5EF6',
  '#F97316',
  '#2563EB',
  '#0D9488',
  '#DB2777',
  '#7C3AED',
] as const;

export function getClaimPortalTheme(scheme: ThemeScheme): ClaimPortalTheme {
  if (scheme === 'dark') {
    return {
      scheme,
      page: '#0B1220',
      card: '#152033',
      cardMuted: '#1B2940',
      text: '#F4F7FB',
      textSecondary: '#A8B3C4',
      textMuted: '#7E8A9C',
      border: '#243249',
      input: '#1B2940',
      chip: '#1B2940',
      chipText: '#D5DDE8',
      overlay: 'rgba(4, 8, 16, 0.55)',
      drawer: '#0A1628',
      drawerText: '#FFFFFF',
      drawerMuted: '#9AA8BB',
      drawerSection: '#7D8B9E',
      drawerItem: '#132033',
      signOutBg: '#2A151B',
      tabBar: '#101A2B',
      sheet: '#152033',
      shadow: '#000000',
      primary: colors.primary,
      onPrimary: colors.onPrimary,
      success: '#22C55E',
      successSoft: '#163226',
      danger: '#F43F5E',
      dangerSoft: '#3A1822',
      warning: '#F59E0B',
      warningSoft: '#3A2C14',
      purple: '#A78BFA',
      purpleSoft: '#2A2150',
      gold: '#FBBF24',
      goldSoft: '#3A2E14',
      orange: '#FB923C',
    };
  }

  return {
    scheme,
    page: '#F4F7FB',
    card: colors.surface,
    cardMuted: colors.surfaceMuted,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    border: colors.border,
    input: colors.inputFill,
    chip: '#EEF2F7',
    chipText: colors.textPrimary,
    overlay: 'rgba(16, 35, 63, 0.46)',
    drawer: '#0D1B2E',
    drawerText: '#FFFFFF',
    drawerMuted: '#9AA8BB',
    drawerSection: '#7D8B9E',
    drawerItem: '#13253D',
    signOutBg: '#2C171C',
    tabBar: colors.surface,
    sheet: colors.surface,
    shadow: colors.shadow,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    success: colors.success,
    successSoft: '#E7F7EE',
    danger: colors.danger,
    dangerSoft: '#FDE8EE',
    warning: '#F59E0B',
    warningSoft: '#FFF4E5',
    purple: '#7C3AED',
    purpleSoft: '#F1E9FF',
    gold: '#D97706',
    goldSoft: '#FFF6E5',
    orange: '#EA580C',
  };
}

export function formatPortalDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${month}/${day}/${year}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'A';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function getAvatarColor(name: string): string {
  const index =
    name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    avatarPalette.length;
  return avatarPalette[index];
}
