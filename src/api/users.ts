import type {
  AppUser,
  CreateBusinessPayload,
  ResetUserPasswordPayload,
  UserFormValues,
  UserListQuery,
  UsersPageResult,
} from '../types/users';
import {USER_PAGE_SIZE} from '../utils/userList';
import {USE_STUB_API} from './config';
import {apiRequest} from './client';
import {
  stubCreateBusinessFromUser,
  stubCreateUser,
  stubDeleteUser,
  stubResetUserPassword,
  stubUpdateUser,
  stubUsersPage,
} from './stubs/users';

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

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
    return false;
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
): UsersPageResult | null {
  if (!looksLikeUsersPage(payload)) {
    return null;
  }

  const fallback = stubUsersPage(query);
  const raw = unwrapPayload(payload);
  const body = asRecord(raw) ?? {};
  const items = Array.isArray(raw)
    ? (raw as AppUser[])
    : Array.isArray(body.items)
      ? (body.items as AppUser[])
      : Array.isArray(body.users)
        ? (body.users as AppUser[])
        : fallback.list.items;
  const page = Number(body.page ?? query.page) || query.page;
  const limit = Number(body.limit ?? query.limit) || query.limit;
  const total = Number(body.total ?? items.length) || items.length;
  const config = asRecord(body.config);

  return {
    config: config
      ? {
          ...fallback.config,
          title:
            typeof config.title === 'string'
              ? config.title
              : fallback.config.title,
          subtitle:
            typeof config.subtitle === 'string'
              ? config.subtitle
              : fallback.config.subtitle,
          businesses: Array.isArray(config.businesses)
            ? (config.businesses as UsersPageResult['config']['businesses'])
            : fallback.config.businesses,
          roles: Array.isArray(config.roles)
            ? (config.roles as string[])
            : fallback.config.roles,
          userTypes: Array.isArray(config.userTypes)
            ? (config.userTypes as string[])
            : fallback.config.userTypes,
          statusChips: Array.isArray(config.statusChips)
            ? (config.statusChips as UsersPageResult['config']['statusChips'])
            : fallback.config.statusChips,
          sortOptions: Array.isArray(config.sortOptions)
            ? (config.sortOptions as UsersPageResult['config']['sortOptions'])
            : fallback.config.sortOptions,
        }
      : fallback.config,
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

async function stubUsersList(query: UserListQuery): Promise<UsersPageResult> {
  await wait(query.page === 1 ? 280 : 200);
  return stubUsersPage(query);
}

async function liveUsersList(query: UserListQuery): Promise<UsersPageResult> {
  try {
    const payload = await apiRequest<unknown>(`/users?${toListParams(query)}`);
    return normalizeUsersPage(payload, query) ?? stubUsersPage(query);
  } catch (error) {
    console.log('[ARC users] list fallback', error);
    return stubUsersPage(query);
  }
}

export function fetchUsersPage(query: UserListQuery): Promise<UsersPageResult> {
  const normalized: UserListQuery = {
    ...query,
    page: Math.max(1, query.page),
    limit: query.limit > 0 ? query.limit : USER_PAGE_SIZE,
  };

  if (USE_STUB_API) {
    return stubUsersList(normalized);
  }

  return liveUsersList(normalized);
}

async function stubSave(values: UserFormValues, id?: string): Promise<AppUser> {
  await wait(220);
  return id ? stubUpdateUser(id, values) : stubCreateUser(values);
}

export async function saveUser(
  values: UserFormValues,
  id?: string,
): Promise<AppUser> {
  if (USE_STUB_API) {
    return stubSave(values, id);
  }

  try {
    return await apiRequest<AppUser>(id ? `/users/${id}` : '/users', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(values),
    });
  } catch (error) {
    console.log('[ARC users] save fallback', error);
    return stubSave(values, id);
  }
}

export async function deleteUser(id: string): Promise<void> {
  if (USE_STUB_API) {
    await wait(180);
    stubDeleteUser(id);
    return;
  }

  try {
    await apiRequest(`/users/${id}`, {method: 'DELETE'});
  } catch (error) {
    console.log('[ARC users] delete fallback', error);
    stubDeleteUser(id);
  }
}

export async function resetUserPassword(
  payload: ResetUserPasswordPayload,
): Promise<AppUser> {
  if (USE_STUB_API) {
    await wait(220);
    return stubResetUserPassword(
      payload.userId,
      payload.password,
      payload.confirmPassword,
    );
  }

  try {
    const saved = await apiRequest<AppUser>(
      `/users/${payload.userId}/reset-password`,
      {
        method: 'POST',
        body: JSON.stringify({
          password: payload.password,
          confirmPassword: payload.confirmPassword,
        }),
      },
    );
    return saved ?? stubResetUserPassword(
      payload.userId,
      payload.password,
      payload.confirmPassword,
    );
  } catch (error) {
    console.log('[ARC users] reset-password fallback', error);
    return stubResetUserPassword(
      payload.userId,
      payload.password,
      payload.confirmPassword,
    );
  }
}

export async function createBusinessFromExisting(
  payload: CreateBusinessPayload,
): Promise<AppUser> {
  if (USE_STUB_API) {
    await wait(240);
    return stubCreateBusinessFromUser(payload.userId, payload.businessName);
  }

  try {
    return await apiRequest<AppUser>('/users/create-business', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.log('[ARC users] create-business fallback', error);
    return stubCreateBusinessFromUser(payload.userId, payload.businessName);
  }
}

export {USER_PAGE_SIZE};
