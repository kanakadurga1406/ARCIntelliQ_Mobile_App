import type {
    AppUser,
    CreateBusinessPayload,
    UserBusinessOption,
    UserFormValues,
    UserListQuery,
    UserStatus,
    UsersPageConfig,
    UsersPageResult,
  } from '../types/users';
  import type {SortOption, StatusChip} from '../types/claimPortals';
  import {uniqueById, USER_PAGE_SIZE} from '../utils/userList';
  import {apiRequest} from './client';
  
  const EMPTY_USERS_CONFIG: UsersPageConfig = {
    title: 'Users',
    subtitle: 'Manage users, roles, and portal access.',
    businesses: [{id: 'all', label: 'All businesses'}],
    roles: [],
    userTypes: [],
    statusChips: [
      {id: 'all', label: 'All'},
      {
        id: 'active',
        label: 'Active',
        filter: {field: 'status', value: 'active'},
      },
      {
        id: 'inactive',
        label: 'Inactive',
        filter: {field: 'status', value: 'inactive'},
      },
    ],
    sortOptions: [
      {id: 'latest', label: 'Latest', field: 'createdAt', direction: 'desc'},
      {id: 'oldest', label: 'Oldest', field: 'createdAt', direction: 'asc'},
      {id: 'name-asc', label: 'Name A-Z', field: 'name', direction: 'asc'},
      {id: 'name-desc', label: 'Name Z-A', field: 'name', direction: 'desc'},
      {id: 'login', label: 'Last login', field: 'lastLoginAt', direction: 'desc'},
    ],
  };
  
  function asRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
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
  
  function readStatus(value: unknown): UserStatus {
    const raw = readString(value).toLowerCase();
    if (
      raw === '0' ||
      raw === 'inactive' ||
      raw === 'disabled' ||
      raw === 'false'
    ) {
      return 'inactive';
    }
    return 'active';
  }
  
  function looksLikeUser(value: unknown): boolean {
    const row = asRecord(value);
    return Boolean(
      row &&
        (row.email ||
          row.user_id ||
          row.userId ||
          (row.name && (row.role || row.status || row.business_id))),
    );
  }
  
  function findUserRows(value: unknown, depth = 0): unknown[] {
    if (value == null || depth > 6) {
      return [];
    }
    if (Array.isArray(value)) {
      if (value.some(looksLikeUser)) {
        return value;
      }
      for (const item of value) {
        const nested = findUserRows(item, depth + 1);
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
  
    for (const key of ['users', 'items', 'records', 'list', 'data']) {
      const nested = findUserRows(record[key], depth + 1);
      if (nested.length > 0) {
        return nested;
      }
    }
  
    return [];
  }
  
  function toAppUser(raw: unknown, index: number): AppUser | null {
    const row = asRecord(raw);
    if (!row) {
      return null;
    }
  
    const id = readString(row.user_id, row.userId, row.uuid, row.email, row.id);
    const name = readString(row.name, row.full_name, row.fullName, row.email);
    const email = readString(row.email);
    if (!id && !name && !email) {
      return null;
    }
  
    return {
      id: id || `user-${index}`,
      name: name || email || `User ${id}`,
      email,
      portalId: readString(row.business_id, row.portalId, row.portal_id),
      portalName: readString(
        row.business_name,
        row.portalName,
        row.portal_name,
        row.business,
      ),
      role: readString(row.role, row.role_name, row.roleName),
      userType: readString(row.user_type, row.userType, row.type),
      status: readStatus(row.status ?? row.is_active ?? row.isActive),
      createdAt: readString(row.created_at, row.createdAt),
      lastLoginAt: readString(row.last_login_at, row.lastLoginAt) || null,
    };
  }
  
  function toBusinessOption(
    raw: unknown,
    index: number,
  ): UserBusinessOption | null {
    if (typeof raw === 'string' && raw.trim()) {
      return {id: raw.trim(), label: raw.trim()};
    }
    const row = asRecord(raw);
    if (!row) {
      return null;
    }
    const id = readString(row.business_id, row.id, row.value) || `biz-${index}`;
    const label = readString(row.label, row.name, row.business_name, id);
    return {id, label};
  }
  
  function toStatusChip(raw: unknown, index: number): StatusChip | null {
    const row = asRecord(raw);
    if (!row) {
      return null;
    }
    const id = readString(row.id, row.value, row.status) || `chip-${index}`;
    const label = readString(row.label, row.name, id);
    return {
      id,
      label,
      count: typeof row.count === 'number' ? row.count : undefined,
      filter: row.filter as StatusChip['filter'],
    };
  }
  
  function toListParams(query: UserListQuery): string {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
      status: query.filters.status,
      businessId: query.filters.businessId,
      userType: query.filters.userType,
      sortBy: query.filters.sortBy,
    });
  
    const search = query.search.trim();
    if (search) {
      params.set('search', search);
    }
  
    return params.toString();
  }
  
  function looksLikeUsersPage(payload: unknown): boolean {
    const body = asRecord(unwrapPayload(payload)) ?? asRecord(payload);
    if (!body) {
      return Array.isArray(payload);
    }
    return (
      Array.isArray(body.items) ||
      Array.isArray(body.users) ||
      typeof body.total === 'number'
    );
  }
  
  function normalizeUsersPage(
    payload: unknown,
    query: UserListQuery,
  ): UsersPageResult {
    const raw = unwrapPayload(payload);
    const body = asRecord(raw) ?? asRecord(payload) ?? {};
    const items = uniqueById(
      findUserRows(payload)
        .map((row, index) => toAppUser(row, index))
        .filter((item): item is AppUser => Boolean(item)),
    );
    console.log('[ARC users] mapped count', items.length);
    const page = Number(body.page ?? query.page) || query.page;
    const limit = Number(body.limit ?? query.limit) || query.limit;
    const total = Number(body.total ?? items.length) || items.length;
    const config = asRecord(body.config);
  
    return {
      config: config
        ? {
            ...EMPTY_USERS_CONFIG,
            title:
              typeof config.title === 'string'
                ? config.title
                : EMPTY_USERS_CONFIG.title,
            subtitle:
              typeof config.subtitle === 'string'
                ? config.subtitle
                : EMPTY_USERS_CONFIG.subtitle,
            businesses: Array.isArray(config.businesses)
              ? uniqueById(
                  config.businesses
                    .map((row, index) => toBusinessOption(row, index))
                    .filter((item): item is UserBusinessOption => Boolean(item)),
                )
              : EMPTY_USERS_CONFIG.businesses,
            roles: Array.isArray(config.roles)
              ? (config.roles as string[])
              : EMPTY_USERS_CONFIG.roles,
            userTypes: Array.isArray(config.userTypes)
              ? (config.userTypes as string[])
              : EMPTY_USERS_CONFIG.userTypes,
            statusChips: Array.isArray(config.statusChips)
              ? uniqueById(
                  config.statusChips
                    .map((row, index) => toStatusChip(row, index))
                    .filter((item): item is StatusChip => Boolean(item)),
                )
              : EMPTY_USERS_CONFIG.statusChips,
            sortOptions: Array.isArray(config.sortOptions)
              ? uniqueById(config.sortOptions as SortOption[])
              : EMPTY_USERS_CONFIG.sortOptions,
          }
        : EMPTY_USERS_CONFIG,
      list: {
        items,
        page,
        limit,
        total,
        hasMore:
          typeof body.hasMore === 'boolean' ? body.hasMore : page * limit < total,
      },
    };
  }
  
  export async function fetchUsersPage(
    query: UserListQuery,
  ): Promise<UsersPageResult> {
    const normalized: UserListQuery = {
      ...query,
      page: Math.max(1, query.page),
      limit: query.limit > 0 ? query.limit : USER_PAGE_SIZE,
    };
  
    const payload = await apiRequest<unknown>(
      `/users?${toListParams(normalized)}`,
    );
    if (
      !looksLikeUsersPage(payload) &&
      !Array.isArray(unwrapPayload(payload)) &&
      findUserRows(payload).length === 0
    ) {
      throw new Error('Users response was not recognized.');
    }
    return normalizeUsersPage(payload, normalized);
  }
  
  export function saveUser(
    values: UserFormValues,
    id?: string,
  ): Promise<AppUser> {
    return apiRequest<AppUser>(id ? `/users/${id}` : '/users', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(values),
    });
  }
  
  export function deleteUser(id: string): Promise<void> {
    return apiRequest(`/users/${id}`, {method: 'DELETE'});
  }
  
  export function createBusinessFromExisting(
    payload: CreateBusinessPayload,
  ): Promise<AppUser> {
    return apiRequest<AppUser>('/users/create-business', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  
  export {USER_PAGE_SIZE};