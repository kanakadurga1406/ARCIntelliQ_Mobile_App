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

export function mergeUniquePortals(
  current: ClaimPortal[],
  incoming: ClaimPortal[],
): ClaimPortal[] {
  const safeCurrent = current ?? [];
  const safeIncoming = incoming ?? [];

  if (safeCurrent.length === 0) {
    return safeIncoming;
  }

  const seen = new Set(safeCurrent.map(item => item.id));
  const next = safeIncoming.filter(item => !seen.has(item.id));
  return next.length === 0 ? safeCurrent : [...safeCurrent, ...next];
}
