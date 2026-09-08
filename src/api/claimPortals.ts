import type {
  ClaimPortal,
  ClaimPortalsDashboard,
  PortalListPage,
  PortalListQuery,
} from '../types/claimPortals';
import {PORTAL_PAGE_SIZE} from '../utils/portalList';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {
  CLAIM_PORTALS_DASHBOARD,
  stubClaimPortalsPage,
} from './stubs/claimPortals';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function unwrapPayload(value: unknown): unknown {
  const record = asRecord(value);
  if (!record) {
    return value;
  }

  const nested = record.data;
  if (nested && typeof nested === 'object') {
    return nested;
  }

  return value;
}

function pickArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeDashboard(payload: unknown): ClaimPortalsDashboard {
  const body = asRecord(unwrapPayload(payload)) ?? {};
  const fallback = CLAIM_PORTALS_DASHBOARD;
  const home = asRecord(body.home);
  const dashboard = asRecord(body.dashboard);
  const portalsPage = asRecord(body.portalsPage);
  const profile = asRecord(body.profile);
  const intake = asRecord(body.intake);

  return {
    statCards: pickArray(body.statCards, fallback.statCards),
    menuItems: pickArray(body.menuItems, fallback.menuItems),
    bottomTabs: pickArray(body.bottomTabs, fallback.bottomTabs),
    home: {
      subtitle:
        typeof home?.subtitle === 'string'
          ? home.subtitle
          : fallback.home.subtitle,
      actions: pickArray(home?.actions, fallback.home.actions),
    },
    dashboard: {
      title:
        typeof dashboard?.title === 'string'
          ? dashboard.title
          : fallback.dashboard.title,
      subtitle:
        typeof dashboard?.subtitle === 'string'
          ? dashboard.subtitle
          : fallback.dashboard.subtitle,
      sections: pickArray(dashboard?.sections, fallback.dashboard.sections),
    },
    portalsPage: {
      title:
        typeof portalsPage?.title === 'string'
          ? portalsPage.title
          : fallback.portalsPage.title,
      subtitle:
        typeof portalsPage?.subtitle === 'string'
          ? portalsPage.subtitle
          : fallback.portalsPage.subtitle,
    },
    statusChips: pickArray(body.statusChips, fallback.statusChips),
    sortOptions: pickArray(body.sortOptions, fallback.sortOptions),
    portalActions: pickArray(body.portalActions, fallback.portalActions),
    profileFields: pickArray(body.profileFields, fallback.profileFields),
    profile: profile
      ? {...fallback.profile, ...profile, fields: pickArray(profile.fields, fallback.profile.fields)}
      : fallback.profile,
    intake: intake ? {...fallback.intake, ...intake} : fallback.intake,
    faqs: pickArray(body.faqs, fallback.faqs),
    requestSummary: pickArray(body.requestSummary, fallback.requestSummary),
    portals: pickArray(body.portals, fallback.portals),
  };
}

function looksLikePortalList(payload: unknown): boolean {
  if (Array.isArray(payload)) {
    return true;
  }

  const body = asRecord(payload);
  if (!body) {
    return false;
  }

  return (
    Array.isArray(body.items) ||
    Array.isArray(body.portals) ||
    Array.isArray(body.data) ||
    typeof body.total === 'number'
  );
}

function normalizePortalList(
  payload: unknown,
  query: PortalListQuery,
): PortalListPage | null {
  const raw = unwrapPayload(payload);
  if (!looksLikePortalList(raw) && !looksLikePortalList(payload)) {
    return null;
  }

  const body = asRecord(raw);
  const items = asArray<ClaimPortal>(
    Array.isArray(raw) ? raw : (body?.items ?? body?.portals ?? body?.data),
  );
  const page = Number(body?.page ?? query.page) || query.page;
  const limit = Number(body?.limit ?? query.limit) || query.limit;
  const total = Number(body?.total ?? items.length) || items.length;
  const hasMore =
    typeof body?.hasMore === 'boolean' ? body.hasMore : page * limit < total;

  return {
    items,
    page,
    limit,
    total,
    hasMore,
  };
}

async function stubClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  await wait(350);
  return CLAIM_PORTALS_DASHBOARD;
}

async function liveClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  try {
    const payload = await apiRequest<unknown>('/claim-portals/dashboard');
    console.log('[ARC portals] dashboard payload', payload);
    return normalizeDashboard(payload);
  } catch (error) {
    console.log('[ARC portals] dashboard fallback', error);
    return CLAIM_PORTALS_DASHBOARD;
  }
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
  try {
    const payload = await apiRequest<unknown>(
      `/claim-portals?${toPortalListParams(query)}`,
    );
    console.log('[ARC portals] list payload', payload);
    return normalizePortalList(payload, query) ?? stubClaimPortalsPage(query);
  } catch (error) {
    console.log('[ARC portals] list fallback', error);
    return stubClaimPortalsPage(query);
  }
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
