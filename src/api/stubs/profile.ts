import type {ProfilePage} from '../../types/profile';

export const PROFILE_PAGE: ProfilePage = {
  statusLabel: 'Active',
  editLabel: 'Edit profile',
  editTitle: 'Edit profile',
  editMessage:
    'Name, title, and contact details will be editable when the identity service is connected.',
  footerLines: ['ARC Global Risk', 'ARCintelliQ Claim Portals'],
  badges: [
    {id: 'status', label: 'Active', tone: 'success'},
    {id: 'role', label: 'Claim Handler', tone: 'primary'},
  ],
  fields: [
    {id: 'handler-id', label: 'Handler ID', value: 'CH-2041'},
    {id: 'region', label: 'Region', value: 'Southeast'},
    {id: 'organization', label: 'Organization', value: 'ARC Global Risk'},
    {id: 'workspace', label: 'Workspace', value: 'ARCintelliQ Claim Portals'},
  ],
  sections: [
    {
      id: 'account',
      title: 'Account',
      rows: [
        {
          id: 'email',
          label: 'Email',
          valueFrom: 'user.email',
          icon: 'mail',
          tone: 'primary',
          kind: 'action',
          destination: 'share-email',
        },
        {
          id: 'handler-id',
          label: 'Handler ID',
          valueFrom: 'field:handler-id',
          icon: 'shield',
          tone: 'purple',
          kind: 'info',
        },
        {
          id: 'region',
          label: 'Region',
          valueFrom: 'field:region',
          icon: 'globe',
          tone: 'success',
          kind: 'info',
        },
        {
          id: 'organization',
          label: 'Organization',
          valueFrom: 'field:organization',
          icon: 'building',
          tone: 'orange',
          kind: 'info',
        },
        {
          id: 'workspace',
          label: 'Workspace',
          valueFrom: 'field:workspace',
          icon: 'globe',
          tone: 'primary',
          kind: 'info',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      rows: [
        {
          id: 'claim-alerts',
          label: 'Claim alerts',
          hint: 'New assignments and portal updates',
          icon: 'bell',
          tone: 'success',
          kind: 'toggle',
          destination: 'toggle-alerts',
          defaultOn: true,
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      rows: [
        {
          id: 'password',
          label: 'Change password',
          value: 'Admin managed',
          icon: 'pencil',
          kind: 'action',
          destination: 'change-password',
          message:
            'Password updates will connect to the live identity service later.',
        },
        {
          id: 'signed-in',
          label: 'Signed in',
          value: 'This device',
          icon: 'shield',
          tone: 'primary',
          kind: 'info',
        },
      ],
    },
    {
      id: 'support',
      title: 'Support',
      rows: [
        {
          id: 'help',
          label: 'Help & support',
          icon: 'mail',
          tone: 'primary',
          kind: 'action',
          destination: 'help',
          message:
            'Contact your ARC Global Risk administrator or email support@arcintelliq.com.',
        },
        {
          id: 'privacy',
          label: 'Privacy & terms',
          icon: 'globe',
          kind: 'action',
          destination: 'privacy',
          message:
            'Legal documents will open from the live portal when they are connected.',
        },
        {
          id: 'about',
          label: 'About',
          value: 'Version 0.0.1',
          icon: 'building',
          kind: 'info',
        },
      ],
    },
    {
      id: 'session',
      rows: [
        {
          id: 'sign-out',
          label: 'Sign out',
          icon: 'logout',
          tone: 'danger',
          kind: 'sign-out',
          destination: 'sign-out',
        },
      ],
    },
  ],
};
