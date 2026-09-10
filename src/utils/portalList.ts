import type {
  ClaimPortal,
  PortalFilters,
  PortalListPage,
} from '../types/claimPortals';

export const PORTAL_PAGE_SIZE = 20;

export function applyPortalFilters(
  portals: ClaimPortal[],
  query: string,
  filters: PortalFilters,
): ClaimPortal[] {
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = (portals ?? []).filter(portal => {
    const matchesQuery =
      !normalizedQuery ||
      portal.name.toLowerCase().includes(normalizedQuery) ||
      portal.businessId.includes(normalizedQuery);

    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'new'
        ? (portal.flags ?? []).includes('newThisMonth')
        : portal.status === filters.status);

    const matchesFrom = !filters.fromDate || portal.createdAt >= filters.fromDate;
    const matchesTo = !filters.toDate || portal.createdAt <= filters.toDate;

    return matchesQuery && matchesStatus && matchesFrom && matchesTo;
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'oldest') {
      return left.createdAt.localeCompare(right.createdAt);
    }
    if (filters.sortBy === 'name-asc') {
      return left.name.localeCompare(right.name);
    }
    if (filters.sortBy === 'name-desc') {
      return right.name.localeCompare(left.name);
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function paginatePortals(
  portals: ClaimPortal[],
  page: number,
  limit: number,
): PortalListPage {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * safeLimit;
  const items = portals.slice(start, start + safeLimit);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total: portals.length,
    hasMore: start + items.length < portals.length,
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

export function mergeUniquePortals(
  current: ClaimPortal[],
  incoming: ClaimPortal[],
): ClaimPortal[] {
  const safeCurrent = current ?? [];
  const uniqueIncoming = uniqueById(incoming ?? []);

  if (safeCurrent.length === 0) {
    return uniqueIncoming;
  }

  const seen = new Set(safeCurrent.map(item => item.id));
  const next = uniqueIncoming.filter(item => !seen.has(item.id));
  return next.length === 0 ? safeCurrent : [...safeCurrent, ...next];
}
