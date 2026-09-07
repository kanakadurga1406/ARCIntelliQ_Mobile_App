import type {UiTone} from './claimPortals';

export type ProfileRowKind = 'info' | 'action' | 'toggle' | 'sign-out';

export type ProfileValueFrom =
  | 'user.email'
  | 'user.name'
  | 'user.title'
  | 'user.id'
  | 'user.role'
  | `field:${string}`;

export type ProfileBadge = {
  id: string;
  label: string;
  tone?: UiTone;
};

export type ProfileRow = {
  id: string;
  label: string;
  value?: string;
  valueFrom?: ProfileValueFrom;
  hint?: string;
  icon: string;
  tone?: UiTone;
  kind: ProfileRowKind;
  destination?: string;
  message?: string;
  defaultOn?: boolean;
};

export type ProfileSection = {
  id: string;
  title?: string;
  rows: ProfileRow[];
};

export type ProfilePage = {
  statusLabel: string;
  editLabel: string;
  editTitle: string;
  editMessage: string;
  footerLines: string[];
  badges: ProfileBadge[];
  sections: ProfileSection[];
  fields: {id: string; label?: string; value: string}[];
};
