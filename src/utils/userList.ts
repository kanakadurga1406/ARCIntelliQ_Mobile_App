import type {AppUser, UserFilters, UserListPage} from '../types/users';

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

export function uniqueById<T extends {id: string}>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  items.forEach((item, index) => {
    const base =
      item.id != null && String(item.id).trim() !== ''
        ? String(item.id)
        : `row-${index}`;
    const id = seen.has(base) ? `${base}-${index}` : base;
    seen.add(id);
    result.push(id === item.id ? item : {...item, id});
  });

  return result;
}

export function mergeUniqueUsers(
  current: AppUser[],
  incoming: AppUser[],
): AppUser[] {
  const safeCurrent = current ?? [];
  const uniqueIncoming = uniqueById(incoming ?? []);

  if (safeCurrent.length === 0) {
    return uniqueIncoming;
  }

  const seen = new Set(safeCurrent.map(item => item.id));
  const next = uniqueIncoming.filter(item => !seen.has(item.id));
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
