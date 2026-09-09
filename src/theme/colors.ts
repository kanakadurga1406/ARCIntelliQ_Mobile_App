export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F5F9FF',

  navy: '#10233F',
  primary: '#2B74FF',
  primaryMid: '#1E6BFF',
  primaryDark: '#1A56D6',
  primaryLight: '#3C8CFF',
  primarySoft: '#6AA8FF',
  primaryDeep: '#1E5EFF',

  accentSoft: '#EAF4FF',
  accentSofter: '#D9EBFF',
  wave: '#E7F2FF',
  waveSoft: '#F3F8FF',
  waveBottom: '#E8F3FF',
  waveBottomSoft: '#F4F9FF',
  dot: '#C9DDF8',

  textPrimary: '#10233F',
  textSecondary: '#6E7B8C',
  textMuted: '#8E9AAB',

  border: '#E3EDF7',
  shadow: '#1B3A66',
  transparent: 'transparent',

  page: '#EEF5FF',
  inputFill: '#F4F8FF',
  danger: '#E11D48',
  success: '#22A55B',
  onPrimary: '#FFFFFF',
} as const;

export const gradients = {
  brandLeft: [colors.primaryLight, colors.primaryDeep],
  brandRight: [colors.primarySoft, colors.primary],
  splashShine: [
    'rgba(43,116,255,0)',
    'rgba(43,116,255,0.16)',
    'rgba(255,255,255,0.78)',
    'rgba(43,116,255,0.16)',
    'rgba(43,116,255,0)',
  ],
} as const;

export type ColorName = keyof typeof colors;
