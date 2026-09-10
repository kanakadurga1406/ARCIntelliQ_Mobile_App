import type {UiTone} from '../types/claimPortals';
import type {
  ClaimColumn,
  ClaimField,
  ClaimHistoryResult,
  ClaimListQuery,
  ClaimRecord,
} from '../types/claims';
import {CLAIM_PAGE_SIZE, uniqueById} from '../utils/claimList';
import {menuPathKey} from '../utils/enteredPortalNav';
import {getEnteredPortal} from './session';
import {ApiError, apiRequest} from './client';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

function looksLikeClaim(value: unknown): boolean {
  const row = asRecord(value);
  return Boolean(
    row &&
      (row.incident_number ||
        row.incidentNumber ||
        row.claim_number ||
        row.claim_id ||
        row.doi ||
        row.dol ||
        row.date_of_incident ||
        row.date_of_loss),
  );
}

function isVisibleFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function columnIcon(icon: string): string {
  const raw = icon.toLowerCase();
  if (raw.includes('user') || raw.includes('adjuster') || raw.includes('person')) {
    return 'users';
  }
  if (raw.includes('calendar') || raw.includes('date') || raw.includes('clock')) {
    return 'calendar';
  }
  if (raw.includes('briefcase') || raw.includes('claim')) {
    return 'briefcase';
  }
  if (raw.includes('folder') || raw.includes('status')) {
    return 'folder';
  }
  if (raw.includes('dollar') || raw.includes('money')) {
    return 'dollar';
  }
  if (raw.includes('building') || raw.includes('portal')) {
    return 'building';
  }
  return 'document';
}

function statusTone(label: string): UiTone {
  const raw = label.toLowerCase();
  if (
    raw.includes('closed') ||
    raw.includes('void') ||
    raw.includes('denied') ||
    raw.includes('no payment')
  ) {
    return 'danger';
  }
  if (
    raw.includes('await') ||
    raw.includes('pending') ||
    raw.includes('hold') ||
    raw.includes('review')
  ) {
    return 'warning';
  }
  if (raw.includes('open') || raw.includes('new') || raw.includes('active')) {
    return 'success';
  }
  return 'primary';
}

function displayValue(value: unknown): string {
  const text = readString(value);
  return text || '—';
}

function parseColumn(item: unknown): ClaimColumn | null {
  const row = asRecord(item);
  if (!row) {
    return null;
  }
  const rowKey = readString(row.row_key, row.rowKey, row.key);
  const key = readString(row.key, rowKey);
  if (!key && !rowKey) {
    return null;
  }
  return {
    key: key || rowKey,
    label: readString(row.label, key || rowKey),
    rowKey: rowKey || key,
    icon: columnIcon(readString(row.icon)),
    cell: readString(row.cell),
    visible: isVisibleFlag(row.visible),
    order: Number(row.order) || 0,
  };
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function readColumnConfig(payload: unknown): {
  columns: ClaimColumn[];
  allColumns: ClaimColumn[];
  inlineLimit: number;
} {
  const root = asRecord(payload) || {};
  const nested = asRecord(root.data) || root;
  const config =
    asRecord(nested.claims_list_column_config) ||
    asRecord(root.claims_list_column_config);

  const raw = Array.isArray(config?.table_columns) ? config.table_columns : [];
  const allColumns = raw
    .map(parseColumn)
    .filter((item): item is ClaimColumn => Boolean(item))
    .sort((left, right) => left.order - right.order);
  const columns = allColumns.filter(column => column.visible);

  const inlineLimit = Number(config?.inline_limit);
  return {
    columns,
    allColumns,
    inlineLimit: Number.isFinite(inlineLimit) && inlineLimit > 0
      ? inlineLimit
      : columns.length,
  };
}

function detailFieldsFromRow(
  row: Record<string, unknown>,
  allColumns: ClaimColumn[],
): ClaimField[] {
  const used = new Set<string>();
  const fields: ClaimField[] = [];

  allColumns.forEach(column => {
    used.add(column.rowKey);
    used.add(column.key);
    fields.push(fieldFromColumn(column, row));
  });

  Object.entries(row).forEach(([key, value]) => {
    if (used.has(key) || value == null || typeof value === 'object') {
      return;
    }
    used.add(key);
    fields.push({
      id: key,
      label: humanizeKey(key),
      value: displayValue(value),
    });
  });

  return fields;
}

function fieldFromColumn(
  column: ClaimColumn,
  row: Record<string, unknown>,
): ClaimField {
  return {
    id: column.key,
    label: column.label,
    value: displayValue(row[column.rowKey] ?? row[column.key]),
    icon: column.icon,
  };
}

function isHeaderColumn(column: ClaimColumn): boolean {
  const key = `${column.cell} ${column.rowKey} ${column.key}`.toLowerCase();
  return (
    column.cell === 'incident' ||
    column.rowKey === 'incident_number' ||
    column.key === 'claim_number' ||
    key.includes('status')
  );
}

function findClaimRows(value: unknown, depth = 0): unknown[] {
  if (value == null || depth > 6) {
    return [];
  }
  if (Array.isArray(value)) {
    if (value.some(looksLikeClaim)) {
      return value;
    }
    for (const item of value) {
      const nested = findClaimRows(item, depth + 1);
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

  for (const key of ['claims', 'items', 'records', 'list', 'data']) {
    const nested = findClaimRows(record[key], depth + 1);
    if (nested.length > 0) {
      return nested;
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nested = findClaimRows(nestedValue, depth + 1);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function toClaimRecord(
  raw: unknown,
  portalId: string,
  columns: ClaimColumn[],
  allColumns: ClaimColumn[],
  inlineLimit: number,
): ClaimRecord | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }

  const id = readString(row.claim_id, row.uuid, row.incident_number, row.id);
  const incidentColumn = columns.find(
    column =>
      column.cell === 'incident' ||
      column.rowKey === 'incident_number' ||
      column.key === 'claim_number',
  );
  const statusColumn = columns.find(
    column =>
      column.rowKey === 'status' ||
      column.key === 'status' ||
      column.cell === 'status',
  );
  const incidentNumber = readString(
    incidentColumn ? row[incidentColumn.rowKey] : undefined,
    row.incident_number,
    row.incidentNumber,
    row.claim_number,
    row.claim_id,
    id,
  );
  if (!id && !incidentNumber) {
    return null;
  }

  const statusLabel = readString(
    statusColumn ? row[statusColumn.rowKey] : undefined,
    row.status_label,
    row.status,
    'open',
  );
  const location = readString(
    row.location_city,
    row.location,
    row.state,
    row.city,
  );
  const fields = detailFieldsFromRow(row, allColumns).map((field, index) => ({
    ...field,
    id: `${field.id}-${index}`,
  }));
  const cardFields = columns
    .filter(column => !isHeaderColumn(column))
    .slice(0, inlineLimit)
    .map((column, index) => ({
      ...fieldFromColumn(column, row),
      id: `${column.key}-${index}`,
    }));

  const values: Record<string, string | number> = {};
  const source: Record<string, string> = {};
  Object.entries(row).forEach(([key, value]) => {
    if (value == null || typeof value === 'object') {
      return;
    }
    const text = displayValue(value);
    source[key] = text;
    values[key] = text;
  });
  columns.forEach(column => {
    values[column.rowKey] = displayValue(row[column.rowKey] ?? row[column.key]);
  });
  values.incidentNumber = incidentNumber;
  values.status = statusLabel;
  if (location) {
    values.location = location;
  }

  return {
    id: id || incidentNumber,
    portalId,
    incidentNumber,
    location: location || undefined,
    status: {
      id: statusLabel.toLowerCase(),
      label: statusLabel,
      tone: statusTone(statusLabel),
    },
    fields,
    cardFields,
    values,
    raw: source,
  };
}

function claimsPath(): string {
  const entered = getEnteredPortal();
  const fromFeature =
    menuPathKey(entered?.firstFeature?.route) === 'claims'
      ? entered?.firstFeature?.route
      : undefined;
  const fromMenu = entered?.menu.find(item => menuPathKey(item.route) === 'claims')
    ?.route;
  const route = fromFeature || fromMenu || '/claims';
  return route.startsWith('/') ? route : `/${route}`;
}

function toClaimListParams(query: ClaimListQuery): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
  });
  if (query.portalId) {
    params.set('business_id', query.portalId);
  }
  const search = query.search.trim();
  if (search) {
    params.set('search', search);
  }
  if (query.filters.status && query.filters.status !== 'all') {
    params.set('status', query.filters.status);
  }
  return params.toString();
}

export async function fetchClaimHistory(
  query: ClaimListQuery,
): Promise<ClaimHistoryResult> {
  const normalized: ClaimListQuery = {
    ...query,
    page: Math.max(1, query.page),
    limit: query.limit > 0 ? query.limit : CLAIM_PAGE_SIZE,
  };

  const path = `${claimsPath()}?${toClaimListParams(normalized)}`;
  const payload = await apiRequest<unknown>(path);
  console.log('[ARC claims] payload', payload);

  const {columns, allColumns, inlineLimit} = readColumnConfig(payload);
  console.log(
    '[ARC claims] visible columns',
    columns.map(column => column.rowKey),
  );
  const rows = findClaimRows(payload);
  const items = uniqueById(
    rows
      .map(row =>
        toClaimRecord(
          row,
          normalized.portalId,
          columns,
          allColumns,
          inlineLimit,
        ),
      )
      .filter((item): item is ClaimRecord => Boolean(item)),
  );
  const root = asRecord(payload) || {};
  const page = Number(root.page ?? normalized.page) || normalized.page;
  const limit = Number(root.length ?? root.limit ?? normalized.limit) || normalized.limit;
  const total =
    Number(root.records_filtered ?? root.records_total ?? root.total ?? items.length) ||
    items.length;

  if (root.status && root.status !== 'success' && items.length === 0) {
    throw new ApiError(
      readString(root.message, 'Unable to load claims.'),
      422,
      payload,
    );
  }

  return {
    config: {
      title: readString(root.title, normalized.portalName) || 'Claims',
      subtitle: readString(root.subtitle),
      statCards: [],
      statusChips: [],
      sortOptions: [],
      filterControls: [],
      dateFilters: [],
      pageActions: [],
      claimActions: [],
    },
    list: {
      items,
      page,
      limit,
      total,
      hasMore:
        typeof root.hasMore === 'boolean' ? root.hasMore : page * limit < total,
    },
  };
}

export {CLAIM_PAGE_SIZE};
