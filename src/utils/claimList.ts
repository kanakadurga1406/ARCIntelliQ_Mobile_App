import type {
  ClaimFilters,
  ClaimListPage,
  ClaimRecord,
} from '../types/claims';

export const CLAIM_PAGE_SIZE = 10;

function claimText(claim: ClaimRecord): string {
  return [
    claim.incidentNumber,
    claim.location ?? '',
    claim.status.label,
    ...claim.fields.map(field => `${field.label} ${field.value}`),
    ...Object.values(claim.values ?? {}).map(String),
  ]
    .join(' ')
    .toLowerCase();
}

function claimValue(claim: ClaimRecord, field: string): string {
  const fromValues = claim.values?.[field];
  if (fromValues !== undefined) {
    return String(fromValues);
  }
  if (field === 'incidentNumber') {
    return claim.incidentNumber;
  }
  if (field === 'status') {
    return claim.status.id;
  }
  if (field === 'location') {
    return claim.location ?? '';
  }
  return claim.fields.find(item => item.id === field)?.value ?? '';
}

export function applyClaimFilters(
  claims: ClaimRecord[],
  search: string,
  filters: ClaimFilters,
): ClaimRecord[] {
  const normalizedQuery = search.trim().toLowerCase();

  const filtered = claims.filter(claim => {
    const matchesQuery =
      !normalizedQuery || claimText(claim).includes(normalizedQuery);
    const matchesStatus =
      filters.status === 'all' || claim.status.id === filters.status;
    const matchesExtras = Object.entries(filters.extras).every(
      ([field, value]) =>
        !value ||
        value === 'all' ||
        claimValue(claim, field) === value,
    );
    const dateValue = claimValue(claim, filters.dateField || 'doi');
    const matchesFrom = !filters.fromDate || dateValue >= filters.fromDate;
    const matchesTo = !filters.toDate || dateValue <= filters.toDate;

    return (
      matchesQuery &&
      matchesStatus &&
      matchesExtras &&
      matchesFrom &&
      matchesTo
    );
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'oldest') {
      return claimValue(left, 'doi').localeCompare(claimValue(right, 'doi'));
    }
    if (filters.sortBy === 'incident-asc') {
      return left.incidentNumber.localeCompare(right.incidentNumber);
    }
    if (filters.sortBy === 'incident-desc') {
      return right.incidentNumber.localeCompare(left.incidentNumber);
    }
    return claimValue(right, 'doi').localeCompare(claimValue(left, 'doi'));
  });
}

export function paginateClaims(
  claims: ClaimRecord[],
  page: number,
  limit: number,
): ClaimListPage {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * safeLimit;
  const items = claims.slice(start, start + safeLimit);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total: claims.length,
    hasMore: start + items.length < claims.length,
  };
}

export function mergeUniqueClaims(
  current: ClaimRecord[],
  incoming: ClaimRecord[],
): ClaimRecord[] {
  if (current.length === 0) {
    return incoming;
  }

  const seen = new Set(current.map(item => item.id));
  const next = incoming.filter(item => !seen.has(item.id));
  return next.length === 0 ? current : [...current, ...next];
}
