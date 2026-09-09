import type {
  AppUser,
  UserAccessAssignment,
  UserFilters,
  UserFormValues,
  UserListPage,
} from '../types/users';

export const USER_PAGE_SIZE = 10;

function userText(user: AppUser): string {
  return [
    user.name,
    user.email,
    user.portalName,
    user.role,
    user.userType,
    user.status,
  ]
    .join(' ')
    .toLowerCase();
}

export function applyUserFilters(
  users: AppUser[],
  search: string,
  filters: UserFilters,
): AppUser[] {
  const normalizedQuery = search.trim().toLowerCase();

  const filtered = (users ?? []).filter(user => {
    const matchesQuery =
      !normalizedQuery || userText(user).includes(normalizedQuery);
    const matchesStatus =
      filters.status === 'all' || user.status === filters.status;
    const matchesBusiness =
      filters.businessId === 'all' || user.portalId === filters.businessId;
    const matchesType =
      filters.userType === 'all' ||
      (filters.userType === 'none'
        ? !user.userType
        : user.userType === filters.userType);

    return matchesQuery && matchesStatus && matchesBusiness && matchesType;
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'name-asc') {
      return left.name.localeCompare(right.name);
    }
    if (filters.sortBy === 'name-desc') {
      return right.name.localeCompare(left.name);
    }
    if (filters.sortBy === 'login') {
      return (right.lastLoginAt ?? '').localeCompare(left.lastLoginAt ?? '');
    }
    if (filters.sortBy === 'oldest') {
      return left.createdAt.localeCompare(right.createdAt);
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function paginateUsers(
  users: AppUser[],
  page: number,
  limit: number,
): UserListPage {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * safeLimit;
  const items = users.slice(start, start + safeLimit);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total: users.length,
    hasMore: start + items.length < users.length,
  };
}

export function mergeUniqueUsers(
  current: AppUser[],
  incoming: AppUser[],
): AppUser[] {
  const safeCurrent = current ?? [];
  const safeIncoming = incoming ?? [];

  if (safeCurrent.length === 0) {
    return safeIncoming;
  }

  const seen = new Set(safeCurrent.map(item => item.id));
  const next = safeIncoming.filter(item => !seen.has(item.id));
  return next.length === 0 ? safeCurrent : [...safeCurrent, ...next];
}

export function formatUserDate(isoDate: string | null): string {
  if (!isoDate) {
    return 'No login records found.';
  }

  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${month}/${day}/${year.slice(-2)}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const PASSWORD_SPECIAL = '@$!%*?&#';

export type PasswordChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
};

export function getPasswordChecks(value: string): PasswordChecks {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /\d/.test(value),
    special: /[@$!%*?&#]/.test(value),
  };
}

export function isStrongPassword(value: string): boolean {
  const checks = getPasswordChecks(value);
  return (
    checks.length &&
    checks.upper &&
    checks.lower &&
    checks.number &&
    checks.special
  );
}

export const IDLE_MINUTE_PRESETS = [15, 30, 60, 120] as const;

export function splitName(name: string): {firstName: string; lastName: string} {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {firstName: '', lastName: ''};
  }
  if (parts.length === 1) {
    return {firstName: parts[0], lastName: ''};
  }
  return {firstName: parts[0], lastName: parts.slice(1).join(' ')};
}

export function displayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function nextAssignmentId(): string {
  return `asg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyAssignment(portalId = ''): UserAccessAssignment {
  return {id: nextAssignmentId(), portalId, role: ''};
}

export function emptyUserForm(defaultPortalId = ''): UserFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    mobileCode: '+1',
    idleMinutes: 15,
    isAdjuster: false,
    isSupervisor: false,
    assignments: [emptyAssignment(defaultPortalId)],
  };
}

export function formFromUser(
  user?: AppUser | null,
  defaultPortalId = '',
): UserFormValues {
  if (!user) {
    return emptyUserForm(defaultPortalId);
  }

  const names =
    user.firstName || user.lastName
      ? {firstName: user.firstName ?? '', lastName: user.lastName ?? ''}
      : splitName(user.name);

  return {
    firstName: names.firstName,
    lastName: names.lastName,
    email: user.email,
    mobile: user.mobile ?? '',
    mobileCode: user.mobileCode ?? '+1',
    idleMinutes: user.idleMinutes ?? 15,
    isAdjuster: user.isAdjuster ?? user.userType === 'Adjuster',
    isSupervisor: user.isSupervisor ?? user.userType === 'Supervisor',
    assignments:
      user.assignments && user.assignments.length > 0
        ? user.assignments
        : [
            {
              id: nextAssignmentId(),
              portalId: user.portalId || defaultPortalId,
              role: user.role,
            },
          ],
  };
}
