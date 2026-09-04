import type {
  ClaimPortalsDashboard,
  PortalListPage,
  PortalListQuery,
} from '../types/claimPortals';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {
  CLAIM_PORTALS_DASHBOARD,
  stubClaimPortalsPage,
} from './stubs/claimPortals';
import {PORTAL_PAGE_SIZE} from '../utils/portalList';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

async function stubClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  await wait(350);
  return CLAIM_PORTALS_DASHBOARD;
}

async function liveClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  return apiRequest<ClaimPortalsDashboard>('/claim-portals/dashboard');
}

export function fetchClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  if (USE_STUB_API) {
    return stubClaimPortalsDashboard();
  }

  return liveClaimPortalsDashboard();
}

function toPortalListParams(query: PortalListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    status: query.filters.status,
    sortBy: query.filters.sortBy,
  });

  const search = query.search.trim();
  if (search) {
    params.set('search', search);
  }
  if (query.filters.fromDate) {
    params.set('fromDate', query.filters.fromDate);
  }
  if (query.filters.toDate) {
    params.set('toDate', query.filters.toDate);
  }

  return params.toString();
}

async function stubClaimPortalsList(
  query: PortalListQuery,
): Promise<PortalListPage> {
  await wait(query.page === 1 ? 280 : 220);
  return stubClaimPortalsPage(query);
}

async function liveClaimPortalsList(
  query: PortalListQuery,
): Promise<PortalListPage> {
  return apiRequest<PortalListPage>(`/claim-portals?${toPortalListParams(query)}`);
}

export function fetchClaimPortalsPage(
  query: PortalListQuery,
): Promise<PortalListPage> {
  const normalized: PortalListQuery = {
    ...query,
    page: Math.max(1, query.page),
    limit: query.limit > 0 ? query.limit : PORTAL_PAGE_SIZE,
  };

  if (USE_STUB_API) {
    return stubClaimPortalsList(normalized);
  }

  return liveClaimPortalsList(normalized);
}

export {PORTAL_PAGE_SIZE};
