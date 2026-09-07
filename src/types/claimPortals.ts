import type {IntakeConfig} from './intake';
import type {ProfilePage} from './profile';

export type UiTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'gold'
  | 'orange';

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  destination: string;
  badge?: number;
  style?: 'default' | 'fab';
};

export type PageAction = {
  id: string;
  label: string;
  destination: string;
};

export type StatCard = {
  id: string;
  title: string;
  value: number | string;
  trend?: number;
  icon: string;
  tone?: UiTone;
  destination?: string;
};

export type DashboardRow = {
  id: string;
  label: string;
  value: number | string;
};

export type DashboardSection = {
  id: string;
  title: string;
  rows: DashboardRow[];
  action?: PageAction;
};

export type StatusChip = {
  id: string;
  label: string;
  count?: number;
  filter?: {
    field: 'status' | 'flag';
    value: string;
  };
};

export type SortOption = {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
};

export type PortalMetaField = {
  id: string;
  label: string;
  value: string;
};

export type PortalMetric = {
  id: string;
  value: number | string;
  icon: string;
};

export type ClaimPortal = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  businessId: string;
  flags?: string[];
  meta: PortalMetaField[];
  metrics: PortalMetric[];
  values?: Record<string, string | number>;
};

export type PortalAction = {
  id: string;
  label: string;
  icon: string;
  destination?: string;
  tone?: UiTone;
};

export type ProfileField = {
  id: string;
  label?: string;
  value: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SummaryRow = {
  id: string;
  label: string;
  value: number | string;
  icon?: string;
  tone?: UiTone;
};

export type PortalFilters = {
  status: string;
  fromDate: string;
  toDate: string;
  sortBy: string;
};

export type PortalListQuery = {
  page: number;
  limit: number;
  search: string;
  filters: PortalFilters;
};

export type PortalListPage = {
  items: ClaimPortal[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ClaimPortalsDashboard = {
  statCards: StatCard[];
  menuItems: NavItem[];
  bottomTabs: NavItem[];
  home: {
    subtitle: string;
    actions: PageAction[];
  };
  dashboard: {
    title: string;
    subtitle: string;
    sections: DashboardSection[];
  };
  portalsPage: {
    title: string;
    subtitle: string;
  };
  statusChips: StatusChip[];
  sortOptions: SortOption[];
  portalActions: PortalAction[];
  profileFields: ProfileField[];
  profile: ProfilePage;
  intake: IntakeConfig;
  faqs: FaqItem[];
  requestSummary: SummaryRow[];
  portals: ClaimPortal[];
};
