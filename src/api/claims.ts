import type {ClaimHistoryResult, ClaimListQuery} from '../types/claims';
import {CLAIM_PAGE_SIZE} from '../utils/claimList';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {stubClaimHistory} from './stubs/claims';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function toClaimListParams(query: ClaimListQuery): string {
  const params = new URLSearchParams({
    portalId: query.portalId,
    page: String(query.page),
    limit: String(query.limit),
    status: query.filters.status,
    sortBy: query.filters.sortBy,
  });

  const search = query.search.trim();
  if (search) {
    params.set('search', search);
  }
  if (query.filters.dateField) {
    params.set('dateField', query.filters.dateField);
  }
  if (query.filters.fromDate) {
    params.set('fromDate', query.filters.fromDate);
  }
  if (query.filters.toDate) {
    params.set('toDate', query.filters.toDate);
  }

  Object.entries(query.filters.extras).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.set(key, value);
    }
  });

  return params.toString();
}

async function stubClaimHistoryPage(
  query: ClaimListQuery,
): Promise<ClaimHistoryResult> {
  await wait(query.page === 1 ? 280 : 200);
  return stubClaimHistory(query);
}

async function liveClaimHistoryPage(
  query: ClaimListQuery,
): Promise<ClaimHistoryResult> {
  return apiRequest<ClaimHistoryResult>(
    `/claim-portals/${query.portalId}/claims?${toClaimListParams(query)}`,
  );
}

export function fetchClaimHistory(
  query: ClaimListQuery,
): Promise<ClaimHistoryResult> {
  const normalized: ClaimListQuery = {
    ...query,
    page: Math.max(1, query.page),
    limit: query.limit > 0 ? query.limit : CLAIM_PAGE_SIZE,
  };

  if (USE_STUB_API) {
    return stubClaimHistoryPage(normalized);
  }

  return liveClaimHistoryPage(normalized);
}

export {CLAIM_PAGE_SIZE};
