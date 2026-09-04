export type PortalStatus = 'active' | 'inactive';

export type PortalSortOption = 'latest' | 'oldest' | 'name-asc' | 'name-desc';

export type PortalStatusFilter = 'all' | 'active' | 'inactive' | 'new';

export type ClaimPortal = {
  id: string;
  name: string;
  businessId: string;
  status: PortalStatus;
  createdAt: string;
  linkedBusinesses: number;
  documents: number;
  assignedUsers: number;
  isNewThisMonth: boolean;
};

export type TrendMap = {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  businessRequests: number;
};

export type PortalStats = {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  businessRequests: number;
  trends: TrendMap;
};

export type BusinessRequestSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type DrawerBadges = {
  businessRequests: number;
  contactRequests: number;
};

export type ClaimPortalsDashboard = {
  portals: ClaimPortal[];
  stats: PortalStats;
  requestSummary: BusinessRequestSummary;
  drawerBadges: DrawerBadges;
};

export type PortalFilters = {
  status: PortalStatusFilter;
  fromDate: string;
  toDate: string;
  sortBy: PortalSortOption;
};
