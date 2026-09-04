import type {ClaimPortal, ClaimPortalsDashboard} from '../../types/claimPortals';
import {formatPortalDate} from '../../theme/claimPortals';
import {FAQS} from './faqs';

type PortalSeed = {
  id: string;
  name: string;
  businessId: string;
  status: string;
  createdAt: string;
  linkedBusinesses: number;
  documents: number;
  assignedUsers: number;
  isNewThisMonth: boolean;
};

function toPortal(seed: PortalSeed): ClaimPortal {
  return {
    id: seed.id,
    name: seed.name,
    status: seed.status,
    createdAt: seed.createdAt,
    businessId: seed.businessId,
    flags: seed.isNewThisMonth ? ['newThisMonth'] : [],
    meta: [
      {id: 'businessId', label: 'BUSINESS ID', value: seed.businessId},
      {
        id: 'createdAt',
        label: 'CREATED DATE',
        value: formatPortalDate(seed.createdAt),
      },
    ],
    metrics: [
      {id: 'linked', value: seed.linkedBusinesses, icon: 'briefcase'},
      {id: 'docs', value: seed.documents, icon: 'folder'},
      {id: 'users', value: seed.assignedUsers, icon: 'users'},
    ],
    values: {
      name: seed.name,
      createdAt: seed.createdAt,
      status: seed.status,
      linkedBusinesses: seed.linkedBusinesses,
      documents: seed.documents,
      assignedUsers: seed.assignedUsers,
    },
  };
}

const PORTAL_SEEDS: PortalSeed[] = [
  {
    id: 'cp-1001',
    name: 'test ARCSK',
    businessId: '562464',
    status: 'active',
    createdAt: '2026-09-02',
    linkedBusinesses: 11,
    documents: 4,
    assignedUsers: 10,
    isNewThisMonth: true,
  },
  {
    id: 'cp-1002',
    name: 'CLANEWWWWWW',
    businessId: '882104',
    status: 'active',
    createdAt: '2026-08-21',
    linkedBusinesses: 3,
    documents: 2,
    assignedUsers: 6,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1003',
    name: 'AARMS',
    businessId: '441902',
    status: 'inactive',
    createdAt: '2026-07-14',
    linkedBusinesses: 1,
    documents: 0,
    assignedUsers: 2,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1004',
    name: 'Summit Claims Group',
    businessId: '710338',
    status: 'active',
    createdAt: '2026-09-01',
    linkedBusinesses: 8,
    documents: 5,
    assignedUsers: 12,
    isNewThisMonth: true,
  },
  {
    id: 'cp-1005',
    name: 'Northwind Adjusters',
    businessId: '229871',
    status: 'active',
    createdAt: '2026-06-18',
    linkedBusinesses: 5,
    documents: 3,
    assignedUsers: 7,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1006',
    name: 'Harbor Point Risk',
    businessId: '993120',
    status: 'inactive',
    createdAt: '2026-05-09',
    linkedBusinesses: 2,
    documents: 1,
    assignedUsers: 3,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1007',
    name: 'Lakeside Mutual',
    businessId: '156774',
    status: 'active',
    createdAt: '2026-08-30',
    linkedBusinesses: 9,
    documents: 6,
    assignedUsers: 14,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1008',
    name: 'Pioneer Loss Services',
    businessId: '604551',
    status: 'active',
    createdAt: '2026-09-03',
    linkedBusinesses: 4,
    documents: 2,
    assignedUsers: 5,
    isNewThisMonth: true,
  },
  {
    id: 'cp-1009',
    name: 'Cedar Ridge Claims',
    businessId: '318206',
    status: 'active',
    createdAt: '2026-04-22',
    linkedBusinesses: 6,
    documents: 4,
    assignedUsers: 8,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1010',
    name: 'Atlas Business Portal',
    businessId: '775430',
    status: 'inactive',
    createdAt: '2026-03-11',
    linkedBusinesses: 0,
    documents: 1,
    assignedUsers: 1,
    isNewThisMonth: false,
  },
  {
    id: 'cp-1011',
    name: 'Blue Oak Partners',
    businessId: '501992',
    status: 'active',
    createdAt: '2026-09-04',
    linkedBusinesses: 7,
    documents: 3,
    assignedUsers: 9,
    isNewThisMonth: true,
  },
  {
    id: 'cp-1012',
    name: 'Evergreen Field Ops',
    businessId: '846013',
    status: 'active',
    createdAt: '2026-07-28',
    linkedBusinesses: 10,
    documents: 8,
    assignedUsers: 15,
    isNewThisMonth: false,
  },
];

const portals = PORTAL_SEEDS.map(toPortal);
const activeCount = PORTAL_SEEDS.filter(item => item.status === 'active').length;
const inactiveCount = PORTAL_SEEDS.filter(item => item.status === 'inactive').length;
const newCount = PORTAL_SEEDS.filter(item => item.isNewThisMonth).length;
const linkedCount = PORTAL_SEEDS.reduce((sum, item) => sum + item.linkedBusinesses, 0);
const documentCount = PORTAL_SEEDS.reduce((sum, item) => sum + item.documents, 0);

export const CLAIM_PORTALS_DASHBOARD: ClaimPortalsDashboard = {
  statCards: [
    {
      id: 'total',
      title: 'Total Portals',
      value: portals.length,
      trend: -20,
      icon: 'building',
      tone: 'primary',
      destination: 'portals',
    },
    {
      id: 'active',
      title: 'Active Portals',
      value: activeCount,
      trend: -30,
      icon: 'layers',
      tone: 'success',
    },
    {
      id: 'inactive',
      title: 'Inactive Portals',
      value: inactiveCount,
      trend: 100,
      icon: 'box',
      tone: 'orange',
    },
    {
      id: 'newThisMonth',
      title: 'New This Month',
      value: newCount,
      trend: -20,
      icon: 'calendar',
      tone: 'purple',
    },
    {
      id: 'linked',
      title: 'Linked Businesses',
      value: linkedCount,
      trend: 12,
      icon: 'briefcase',
      tone: 'gold',
    },
    {
      id: 'documents',
      title: 'Documents',
      value: documentCount,
      trend: 8,
      icon: 'folder',
      tone: 'primary',
    },
  ],
  menuItems: [
    {id: 'claim-portals', label: 'Claim Portals', icon: 'grid', destination: 'portals'},
    {id: 'dashboard', label: 'Dashboard', icon: 'dashboard', destination: 'dashboard'},
    {id: 'add-claim', label: 'Add Claim', icon: 'plus', destination: 'add-claim'},
    {id: 'smart-search', label: 'Smart Search', icon: 'search', destination: 'smart-search'},
    {id: 'profile', label: 'Profile', icon: 'profile', destination: 'profile'},
  ],
  bottomTabs: [
    {id: 'home', label: 'Home', icon: 'home', destination: 'home'},
    {id: 'portals', label: 'Claim Portals', icon: 'grid', destination: 'portals'},
    {
      id: 'add-claim',
      label: 'Add Claim',
      icon: 'plus',
      destination: 'add-claim',
      style: 'fab',
    },
    {id: 'dashboard', label: 'Dashboard', icon: 'dashboard', destination: 'dashboard'},
    {id: 'profile', label: 'Profile', icon: 'profile', destination: 'profile'},
  ],
  home: {
    subtitle: 'A live snapshot of your claim workspace.',
    actions: [
      {id: 'open-portals', label: 'Open Claim Portals', destination: 'portals'},
    ],
  },
  dashboard: {
    title: 'Workspace overview',
    subtitle: 'Track portal health without leaving this screen.',
    sections: [
      {
        id: 'portal-health',
        title: 'PORTAL HEALTH',
        rows: [
          {id: 'total', label: 'Total portals', value: portals.length},
          {id: 'active', label: 'Active', value: activeCount},
          {id: 'inactive', label: 'Inactive', value: inactiveCount},
          {id: 'new', label: 'New this month', value: newCount},
          {id: 'linked', label: 'Linked businesses', value: linkedCount},
          {id: 'documents', label: 'Documents', value: documentCount},
        ],
        action: {
          id: 'manage-portals',
          label: 'Manage Claim Portals',
          destination: 'portals',
        },
      },
    ],
  },
  portalsPage: {
    title: 'Claim Portals',
    subtitle: 'Manage and monitor all business portals',
  },
  statusChips: [
    {id: 'all', label: 'All', count: portals.length},
    {
      id: 'active',
      label: 'Active',
      count: activeCount,
      filter: {field: 'status', value: 'active'},
    },
    {
      id: 'inactive',
      label: 'Inactive',
      count: inactiveCount,
      filter: {field: 'status', value: 'inactive'},
    },
    {
      id: 'new',
      label: 'New',
      count: newCount,
      filter: {field: 'flag', value: 'newThisMonth'},
    },
  ],
  sortOptions: [
    {id: 'latest', label: 'Latest', field: 'createdAt', direction: 'desc'},
    {id: 'oldest', label: 'Oldest', field: 'createdAt', direction: 'asc'},
    {id: 'name-asc', label: 'Name A-Z', field: 'name', direction: 'asc'},
    {id: 'name-desc', label: 'Name Z-A', field: 'name', direction: 'desc'},
  ],
  portalActions: [
    {id: 'view', label: 'View Details', icon: 'eye', destination: 'view'},
    {id: 'edit', label: 'Edit Portal', icon: 'pencil', destination: 'edit'},
    {id: 'clone', label: 'Clone Portal', icon: 'copy', destination: 'clone'},
    {
      id: 'delete',
      label: 'Delete Portal',
      icon: 'trash',
      destination: 'delete',
      tone: 'danger',
    },
  ],
  profileFields: [
    {id: 'handler-id', label: 'Handler ID', value: 'CH-2041'},
    {id: 'region', label: 'Region', value: 'Southeast'},
  ],
  faqs: FAQS,
  requestSummary: [
    {id: 'total', label: 'Total', value: 5, icon: 'document'},
    {id: 'pending', label: 'Pending', value: 2, icon: 'clock', tone: 'warning'},
    {id: 'approved', label: 'Approved', value: 2, icon: 'check', tone: 'success'},
    {id: 'rejected', label: 'Rejected', value: 1, icon: 'trash', tone: 'danger'},
  ],
  portals,
};
