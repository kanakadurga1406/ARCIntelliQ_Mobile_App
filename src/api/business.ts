import type {AuthSession, ClaimHandlerUser} from '../types/auth';
import type {
  ClaimPortal,
  ClaimPortalsDashboard,
  NavItem,
  PortalListPage,
  PortalListQuery,
  StatusChip,
} from '../types/claimPortals';
import type {IntakeConfig} from '../types/intake';
import type {ProfilePage} from '../types/profile';
import {
  applyPortalFilters,
  paginatePortals,
  PORTAL_PAGE_SIZE,
} from '../utils/portalList';
import {ApiError, apiRequest} from './client';
import {
  getSession,
  setEnteredPortal,
  type EnteredPortal,
} from './session';

export type PostLoginDestination =
  | {kind: 'portals'}
  | {kind: 'enter'; businessId: string; businessName: string};

let cachedBusinesses: ClaimPortal[] | null = null;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function looksLikeBusiness(value: unknown): boolean {
  const row = asRecord(value);
  return Boolean(
    row && (row.business_name || row.business_id || row.status_label),
  );
}

function findBusinessRows(value: unknown, depth = 0): unknown[] {
  if (value == null || depth > 5) {
    return [];
  }

  if (Array.isArray(value)) {
    if (value.some(looksLikeBusiness)) {
      return value;
    }
    for (const item of value) {
      const nested = findBusinessRows(item, depth + 1);
      if (nested.length > 0) {
        return nested;
      }
    }
    return [];
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  const preferred = [
    'businesses',
    'items',
    'portals',
    'claim_portals',
    'records',
    'list',
    'data',
  ];

  for (const key of preferred) {
    const nested = findBusinessRows(record[key], depth + 1);
    if (nested.length > 0) {
      return nested;
    }
  }

  for (const [key, nestedValue] of Object.entries(record)) {
    if (key === 'left_menu' || key === 'permissions') {
      continue;
    }
    const nested = findBusinessRows(nestedValue, depth + 1);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function readStatus(row: Record<string, unknown>): string {
  const label = readString(row.status_label, row.state_label).toLowerCase();
  if (label) {
    return label;
  }
  if (row.status === 1 || row.status === '1' || row.is_active === true) {
    return 'active';
  }
  if (row.status === 0 || row.status === '0' || row.is_active === false) {
    return 'inactive';
  }
  return readString(row.status, row.state, 'active') || 'active';
}

function menuIcon(icon: string, name: string): string {
  const raw = `${icon} ${name}`.toLowerCase();
  if (raw.includes('intake') || raw.includes('list')) {
    return 'document';
  }
  if (raw.includes('claim') || raw.includes('briefcase')) {
    return 'briefcase';
  }
  return 'grid';
}

function menuDestination(route: string, name: string): string {
  const raw = `${route} ${name}`.toLowerCase();
  if (raw.includes('intake')) {
    return 'add-claim';
  }
  if (raw.includes('claim')) {
    return 'claims';
  }
  return name.toLowerCase().replace(/\s+/g, '-');
}

function flattenMenu(value: unknown): NavItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: NavItem[] = [];
  value.forEach(node => {
    const row = asRecord(node);
    if (!row) {
      return;
    }
    const children = flattenMenu(row.children);
    if (children.length > 0) {
      items.push(...children);
      return;
    }
    const id = readString(row.id, row.route, row.name);
    const label = readString(row.name, row.label);
    if (!id || !label) {
      return;
    }
    items.push({
      id,
      label,
      icon: menuIcon(readString(row.icon), label),
      destination: menuDestination(readString(row.route), label),
    });
  });
  return items;
}

export function parseEnteredPortal(payload: unknown): EnteredPortal | null {
  const root = asRecord(payload) || {};
  const nested = asRecord(root.data) || root;
  const context = asRecord(nested.portal_context);
  const business =
    asRecord(nested.business) ||
    asRecord(context?.business) ||
    asRecord(asRecord(nested.landing)?.business);

  const businessId = readString(
    nested.business_id,
    business?.business_id,
    business?.id,
  );
  const businessName = readString(
    nested.business_name,
    business?.business_name,
    business?.name,
  );
  if (!businessId && !businessName) {
    return null;
  }

  const menu = flattenMenu(nested.left_menu).length
    ? flattenMenu(nested.left_menu)
    : flattenMenu(context?.menu);

  return {
    businessId,
    businessName,
    logoUrl: readString(
      nested.business_logo_url,
      business?.business_logo_url,
    ),
    menu: [
      ...menu,
      {id: 'sign-out', label: 'Sign out', icon: 'logout', destination: 'sign-out'},
    ],
  };
}

export function toClaimPortal(raw: unknown): ClaimPortal | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }

  const id = readString(row.id, row.business_id, row.uuid);
  if (!id) {
    return null;
  }

  const name = readString(
    row.name,
    row.business_name,
    row.title,
    `Business ${id}`,
  );
  const businessId = readString(row.business_id, row.id, id);
  const createdAt = readString(row.created_at, row.createdAt, row.updated_at);
  const status = readStatus(row);
  const isMaster =
    row.is_master_business === true ||
    row.is_master_business === 1 ||
    row.is_master_business === '1';

  return {
    id,
    name,
    status,
    createdAt,
    businessId,
    flags: isMaster ? ['master'] : [],
    meta: [
      {id: 'businessId', label: 'BUSINESS ID', value: businessId},
      {id: 'createdAt', label: 'CREATED DATE', value: createdAt},
    ],
    metrics: [
      {
        id: 'linked',
        value: Number(row.total_claims ?? 0),
        icon: 'briefcase',
      },
      {
        id: 'docs',
        value: Number(row.open_claims ?? 0),
        icon: 'folder',
      },
      {
        id: 'week',
        value: Number(row.claims_this_week ?? 0),
        icon: 'calendar',
      },
    ],
    values: {name, createdAt, status},
  };
}

export function mapBusinesses(payload: unknown): ClaimPortal[] {
  const list = findBusinessRows(payload);
  const items = list
    .map(toClaimPortal)
    .filter((item): item is ClaimPortal => Boolean(item));
  console.log('[ARC business] mapped count', items.length);
  return items;
}

export function cacheBusinesses(items: ClaimPortal[]): void {
  cachedBusinesses = items;
}

export function getCachedBusinesses(): ClaimPortal[] | null {
  return cachedBusinesses;
}

export function clearBusinessCache(): void {
  cachedBusinesses = null;
}

export async function fetchBusinessList(): Promise<ClaimPortal[]> {
  const payload = await apiRequest<unknown>('/business');
  console.log('[ARC business] list payload', payload);
  const items = mapBusinesses(payload);
  cacheBusinesses(items);
  return items;
}

export async function enterBusiness(
  businessId: string,
  token?: string,
): Promise<EnteredPortal> {
  const sessionToken = token || getSession()?.token || '';
  const payload = await apiRequest<unknown>('/business/enter', {
    method: 'POST',
    body: JSON.stringify({
      business_id: String(businessId),
      token: sessionToken,
    }),
  });
  console.log('[ARC business] enter payload', payload);
  const entered = parseEnteredPortal(payload);
  if (!entered) {
    throw new ApiError('Unable to enter this business.', 422, payload);
  }
  setEnteredPortal(entered);
  return entered;
}

export async function completePostLoginLanding(
  session: AuthSession,
): Promise<PostLoginDestination> {
  if (session.landing.showClaimPortals) {
    await fetchBusinessList();
    return {kind: 'portals'};
  }

  const businessId = session.landing.businessId;
  if (!businessId) {
    throw new ApiError('No business was returned to enter.', 422);
  }

  const entered = await enterBusiness(businessId, session.token);
  return {
    kind: 'enter',
    businessId: entered.businessId || businessId,
    businessName:
      entered.businessName ||
      session.landing.businessName ||
      `Business ${businessId}`,
  };
}

const EMPTY_INTAKE: IntakeConfig = {
  requiredHint: '',
  nextLabel: 'Next',
  previousLabel: 'Back',
  submitLabel: 'Submit',
  submitTitle: '',
  submitMessage: '',
  discardTitle: '',
  discardMessage: '',
  steps: [],
};

const SORT_OPTIONS = [
  {id: 'latest', label: 'Latest', field: 'createdAt', direction: 'desc' as const},
  {id: 'oldest', label: 'Oldest', field: 'createdAt', direction: 'asc' as const},
  {id: 'name-asc', label: 'Name A-Z', field: 'name', direction: 'asc' as const},
  {id: 'name-desc', label: 'Name Z-A', field: 'name', direction: 'desc' as const},
];

export function profileFromUser(user: ClaimHandlerUser): ProfilePage {
  return {
    statusLabel: 'Signed in',
    editLabel: '',
    editTitle: '',
    editMessage: '',
    footerLines: [],
    badges: [
      {id: 'title', label: user.title || 'Claim Handler', tone: 'primary'},
    ],
    fields: [
      {id: 'id', label: 'User ID', value: user.id},
      {id: 'email', label: 'Email', value: user.email},
    ],
    sections: [
      {
        id: 'account',
        title: 'Account',
        rows: [
          {
            id: 'name',
            label: 'Name',
            valueFrom: 'user.name',
            icon: 'profile',
            kind: 'info',
          },
          {
            id: 'email',
            label: 'Email',
            valueFrom: 'user.email',
            icon: 'mail',
            kind: 'info',
          },
          {
            id: 'title',
            label: 'Title',
            valueFrom: 'user.title',
            icon: 'shield',
            kind: 'info',
          },
          {
            id: 'id',
            label: 'User ID',
            valueFrom: 'user.id',
            icon: 'users',
            kind: 'info',
          },
          {
            id: 'sign-out',
            label: 'Sign out',
            icon: 'logout',
            kind: 'sign-out',
            destination: 'sign-out',
          },
        ],
      },
    ],
  };
}

function statusChipsFrom(items: ClaimPortal[]): StatusChip[] {
  const counts = new Map<string, number>();
  items.forEach(item => {
    const status = item.status || 'unknown';
    counts.set(status, (counts.get(status) ?? 0) + 1);
  });

  return [
    {id: 'all', label: 'All', count: items.length},
    ...Array.from(counts.entries()).map(([status, count]) => ({
      id: status,
      label: status,
      count,
      filter: {field: 'status' as const, value: status},
    })),
  ];
}

export function dashboardFromBusinesses(
  items: ClaimPortal[],
): ClaimPortalsDashboard {
  const chips = statusChipsFrom(items);

  return {
    statCards: chips
      .filter(chip => chip.id !== 'all')
      .slice(0, 6)
      .map(chip => ({
        id: chip.id,
        title: chip.label,
        value: chip.count ?? 0,
        icon: 'building',
        tone: chip.id.toLowerCase() === 'active' ? 'success' : 'primary',
      })),
    menuItems: [
      {
        id: 'claim-portals',
        label: 'Claim Portals',
        icon: 'grid',
        destination: 'portals',
      },
      {id: 'profile', label: 'Profile', icon: 'profile', destination: 'profile'},
      {id: 'sign-out', label: 'Sign out', icon: 'logout', destination: 'sign-out'},
    ],
    bottomTabs: [],
    home: {subtitle: '', actions: []},
    dashboard: {
      title: 'Businesses',
      subtitle: `${items.length} returned by /business`,
      sections: [
        {
          id: 'businesses',
          title: 'FROM /BUSINESS',
          rows: chips.map(chip => ({
            id: chip.id,
            label: chip.label,
            value: chip.count ?? 0,
          })),
        },
      ],
    },
    portalsPage: {
      title: 'Claim Portals',
      subtitle: `${items.length} businesses from the live API`,
    },
    statusChips: chips,
    sortOptions: SORT_OPTIONS,
    portalActions: [
      {id: 'view', label: 'Open', icon: 'eye', destination: 'view'},
    ],
    profileFields: [],
    profile: profileFromUser({
      id: '',
      name: '',
      email: '',
      role: 'claim-handler',
      title: '',
    }),
    intake: EMPTY_INTAKE,
    faqs: [],
    requestSummary: [],
    portals: items,
  };
}

async function loadBusinesses(): Promise<ClaimPortal[]> {
  const cached = getCachedBusinesses();
  if (cached && cached.length > 0) {
    return cached;
  }
  return fetchBusinessList();
}

export async function fetchClaimPortalsDashboard(): Promise<ClaimPortalsDashboard> {
  const items = await loadBusinesses();
  return dashboardFromBusinesses(items);
}

export async function fetchClaimPortalsPage(
  query: PortalListQuery,
): Promise<PortalListPage> {
  const items = await loadBusinesses();
  const filtered = applyPortalFilters(items, query.search, query.filters);
  return paginatePortals(
    filtered,
    Math.max(1, query.page),
    query.limit > 0 ? query.limit : PORTAL_PAGE_SIZE,
  );
}

export {PORTAL_PAGE_SIZE};
