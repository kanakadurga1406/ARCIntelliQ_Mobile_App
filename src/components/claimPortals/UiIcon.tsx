import React from 'react';
import type {ClaimPortalTheme} from '../../theme/claimPortals';
import type {UiTone} from '../../types/claimPortals';
import {
  BoxIcon,
  BriefcaseMiniIcon,
  CalendarIcon,
  CheckMiniIcon,
  ClockMiniIcon,
  CopyMiniIcon,
  DashboardTabIcon,
  DocumentIcon,
  EyeMiniIcon,
  FolderMiniIcon,
  GridTabIcon,
  HomeTabIcon,
  LayersIcon,
  LogoutMiniIcon,
  PencilMiniIcon,
  PlusMiniIcon,
  ProfileTabIcon,
  SearchIcon,
  TrashMiniIcon,
  UsersMiniIcon,
  BuildingIcon,
  DollarIcon,
  MicIcon,
  SendIcon,
  SparkleIcon,
} from './ClaimPortalsIcons';

type IconComponent = React.ComponentType<{color?: string; size?: number}>;

const ICONS: Record<string, IconComponent> = {
  building: BuildingIcon,
  layers: LayersIcon,
  box: BoxIcon,
  calendar: CalendarIcon,
  document: DocumentIcon,
  home: HomeTabIcon,
  grid: GridTabIcon,
  dashboard: DashboardTabIcon,
  profile: ProfileTabIcon,
  search: SearchIcon,
  plus: PlusMiniIcon,
  briefcase: BriefcaseMiniIcon,
  folder: FolderMiniIcon,
  users: UsersMiniIcon,
  eye: EyeMiniIcon,
  pencil: PencilMiniIcon,
  copy: CopyMiniIcon,
  trash: TrashMiniIcon,
  logout: LogoutMiniIcon,
  clock: ClockMiniIcon,
  check: CheckMiniIcon,
  dollar: DollarIcon,
  sparkle: SparkleIcon,
  mic: MicIcon,
  send: SendIcon,
};

type UiIconProps = {
  name: string;
  color?: string;
  size?: number;
};

export function UiIcon({name, color, size}: UiIconProps) {
  const Icon = ICONS[name] ?? DocumentIcon;
  return <Icon color={color} size={size} />;
}

export function getToneColors(theme: ClaimPortalTheme, tone?: UiTone | string) {
  switch (tone) {
    case 'success':
      return {fg: theme.success, bg: theme.successSoft};
    case 'warning':
      return {fg: theme.warning, bg: theme.warningSoft};
    case 'danger':
      return {fg: theme.danger, bg: theme.dangerSoft};
    case 'purple':
      return {fg: theme.purple, bg: theme.purpleSoft};
    case 'gold':
      return {fg: theme.gold, bg: theme.goldSoft};
    case 'orange':
      return {fg: theme.orange, bg: theme.warningSoft};
    default:
      return {
        fg: theme.primary,
        bg: theme.scheme === 'dark' ? theme.cardMuted : '#E8F1FF',
      };
  }
}
