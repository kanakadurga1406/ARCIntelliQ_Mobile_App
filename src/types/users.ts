import type {SortOption, StatusChip} from './claimPortals';

export type UserStatus = 'active' | 'inactive';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  portalId: string;
  portalName: string;
  role: string;
  userType: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
};

export type UserFilters = {
  status: string;
  businessId: string;
  userType: string;
  sortBy: string;
};

export type UserListQuery = {
  page: number;
  limit: number;
  search: string;
  filters: UserFilters;
};

export type UserListPage = {
  items: AppUser[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type UserFormValues = {
  name: string;
  email: string;
  portalId: string;
  role: string;
  userType: string;
  status: UserStatus;
};

export type UserBusinessOption = {
  id: string;
  label: string;
};

export type UsersPageConfig = {
  title: string;
  subtitle: string;
  businesses: UserBusinessOption[];
  roles: string[];
  userTypes: string[];
  statusChips: StatusChip[];
  sortOptions: SortOption[];
};

export type UsersPageResult = {
  config: UsersPageConfig;
  list: UserListPage;
};

export type CreateBusinessPayload = {
  userId: string;
  businessName: string;
};
