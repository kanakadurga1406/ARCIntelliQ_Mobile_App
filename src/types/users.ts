import type {SortOption, StatusChip} from './claimPortals';

export type UserStatus = 'active' | 'inactive';

export type UserAccessAssignment = {
  id: string;
  portalId: string;
  role: string;
};

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
  firstName?: string;
  lastName?: string;
  mobile?: string;
  mobileCode?: string;
  idleMinutes?: number;
  isAdjuster?: boolean;
  isSupervisor?: boolean;
  assignments?: UserAccessAssignment[];
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
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  mobileCode: string;
  idleMinutes: number;
  isAdjuster: boolean;
  isSupervisor: boolean;
  assignments: UserAccessAssignment[];
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

export type ResetUserPasswordPayload = {
  userId: string;
  password: string;
  confirmPassword: string;
};
