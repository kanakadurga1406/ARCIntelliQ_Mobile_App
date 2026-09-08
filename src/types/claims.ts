import type {
  PageAction,
  PortalAction,
  SortOption,
  StatCard,
  StatusChip,
  UiTone,
} from './claimPortals';

export type ClaimField = {
  id: string;
  label: string;
  value: string;
  icon?: string;
};

export type ClaimStatus = {
  id: string;
  label: string;
  tone?: UiTone;
  hint?: string;
};

export type ClaimRecord = {
  id: string;
  portalId: string;
  incidentNumber: string;
  location?: string;
  status: ClaimStatus;
  fields: ClaimField[];
  values?: Record<string, string | number>;
};

export type ClaimFilterControl = {
  id: string;
  label: string;
  options: {
    id: string;
    label: string;
  }[];
};

export type ClaimDateFilter = {
  id: string;
  label: string;
};

export type ClaimFilters = {
  status: string;
  sortBy: string;
  dateField: string;
  fromDate: string;
  toDate: string;
  extras: Record<string, string>;
};

export type ClaimListQuery = {
  portalId: string;
  portalName: string;
  page: number;
  limit: number;
  search: string;
  filters: ClaimFilters;
};

export type ClaimListPage = {
  items: ClaimRecord[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ClaimHistoryConfig = {
  title: string;
  subtitle: string;
  statCards: StatCard[];
  statusChips: StatusChip[];
  sortOptions: SortOption[];
  filterControls: ClaimFilterControl[];
  dateFilters: ClaimDateFilter[];
  pageActions: PageAction[];
  claimActions: PortalAction[];
};

export type ClaimHistoryResult = {
  config: ClaimHistoryConfig;
  list: ClaimListPage;
};
