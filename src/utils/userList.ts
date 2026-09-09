import type {
  AppUser,
  PasswordPolicy,
  PasswordRule,
  ResetPasswordConfig,
  UserAccessAssignment,
  UserFilters,
  UserFormValues,
  UserListPage,
} from '../types/users';

export const USER_PAGE_SIZE = 10;

function userText(user: AppUser): string {
  return [
    user.name,
    user.email,
    user.portalName,
    user.role,
    user.userType,
    user.status,
  ]
    .join(' ')
    .toLowerCase();
}

export function applyUserFilters(
  users: AppUser[],
  search: string,
  filters: UserFilters,
): AppUser[] {
  const normalizedQuery = search.trim().toLowerCase();

  const filtered = (users ?? []).filter(user => {
    const matchesQuery =
      !normalizedQuery || userText(user).includes(normalizedQuery);
    const matchesStatus =
      filters.status === 'all' || user.status === filters.status;
    const matchesBusiness =
      filters.businessId === 'all' || user.portalId === filters.businessId;
    const matchesType =
      filters.userType === 'all' ||
      (filters.userType === 'none'
        ? !user.userType
        : user.userType === filters.userType);

    return matchesQuery && matchesStatus && matchesBusiness && matchesType;
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'name-asc') {
      return left.name.localeCompare(right.name);
    }
    if (filters.sortBy === 'name-desc') {
      return right.name.localeCompare(left.name);
    }
    if (filters.sortBy === 'login') {
      return (right.lastLoginAt ?? '').localeCompare(left.lastLoginAt ?? '');
    }
    if (filters.sortBy === 'oldest') {
      return left.createdAt.localeCompare(right.createdAt);
    }
    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function paginateUsers(
  users: AppUser[],
  page: number,
  limit: number,
): UserListPage {
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * safeLimit;
  const items = users.slice(start, start + safeLimit);

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total: users.length,
    hasMore: start + items.length < users.length,
  };
}

export function mergeUniqueUsers(
  current: AppUser[],
  incoming: AppUser[],
): AppUser[] {
  const safeCurrent = current ?? [];
  const safeIncoming = incoming ?? [];

  if (safeCurrent.length === 0) {
    return safeIncoming;
  }

  const seen = new Set(safeCurrent.map(item => item.id));
  const next = safeIncoming.filter(item => !seen.has(item.id));
  return next.length === 0 ? safeCurrent : [...safeCurrent, ...next];
}

export function formatUserDate(isoDate: string | null): string {
  if (!isoDate) {
    return 'No login records found.';
  }

  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${month}/${day}/${year.slice(-2)}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeCharClass(value: string): string {
  return value.replace(/[\\\]^-]/g, '\\$&');
}

export function buildPasswordRules(
  policy: Omit<PasswordPolicy, 'rules'>,
): PasswordRule[] {
  const rules: PasswordRule[] = [
    {
      id: 'length',
      label: `At least ${policy.minLength} characters`,
      minLength: policy.minLength,
    },
  ];

  if (policy.requireUpper) {
    rules.push({
      id: 'upper',
      label: 'One uppercase letter (A, B, C...)',
      pattern: '[A-Z]',
    });
  }
  if (policy.requireLower) {
    rules.push({
      id: 'lower',
      label: 'One lowercase letter (a, b, c...)',
      pattern: '[a-z]',
    });
  }
  if (policy.requireNumber) {
    rules.push({
      id: 'number',
      label: 'One number (0, 1, 2...)',
      pattern: '\\d',
    });
  }
  if (policy.requireSpecial) {
    rules.push({
      id: 'special',
      label: `One special character (${policy.specialChars})`,
      pattern: `[${escapeCharClass(policy.specialChars)}]`,
    });
  }

  return rules;
}

const DEFAULT_POLICY_FLAGS: Omit<PasswordPolicy, 'rules'> = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSpecial: true,
  specialChars: '@$!%*?&#',
};

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  ...DEFAULT_POLICY_FLAGS,
  rules: buildPasswordRules(DEFAULT_POLICY_FLAGS),
};

export const DEFAULT_RESET_PASSWORD_CONFIG: ResetPasswordConfig = {
  kicker: 'USER SECURITY',
  title: 'Reset password',
  subtitle: 'Set a secure new password for this user account.',
  accountLabel: 'USER ACCOUNT',
  passwordLabel: 'New password',
  passwordPlaceholder: 'Enter new password',
  confirmLabel: 'Confirm password',
  confirmPlaceholder: 'Confirm new password',
  rulesTitle: 'Password requirements',
  matchLabel: 'Passwords match',
  backLabel: 'Back',
  saveLabel: 'Save',
  savingLabel: 'Saving...',
  copyright: '© 2026 ARC Global Risk · Powered by WebAppClouds',
  emptyPassword: 'Enter a new password.',
  weakPassword: 'Password does not meet the security requirements.',
  emptyConfirm: 'Confirm the new password.',
  mismatch: 'Passwords do not match.',
  saveErrorTitle: 'Unable to reset password',
  strengthLabels: ['Weak', 'Fair', 'Strong', 'Excellent'],
  policy: DEFAULT_PASSWORD_POLICY,
};

export function mergePasswordPolicy(incoming?: unknown): PasswordPolicy {
  const raw = asRecord(incoming) ?? {};
  const flags: Omit<PasswordPolicy, 'rules'> = {
    minLength: asNumber(raw.minLength, DEFAULT_POLICY_FLAGS.minLength),
    requireUpper: asBool(raw.requireUpper, DEFAULT_POLICY_FLAGS.requireUpper),
    requireLower: asBool(raw.requireLower, DEFAULT_POLICY_FLAGS.requireLower),
    requireNumber: asBool(raw.requireNumber, DEFAULT_POLICY_FLAGS.requireNumber),
    requireSpecial: asBool(
      raw.requireSpecial,
      DEFAULT_POLICY_FLAGS.requireSpecial,
    ),
    specialChars: asString(raw.specialChars, DEFAULT_POLICY_FLAGS.specialChars),
  };

  const incomingRules: PasswordRule[] = [];
  if (Array.isArray(raw.rules)) {
    raw.rules.forEach(item => {
      const rule = asRecord(item);
      if (
        !rule ||
        typeof rule.id !== 'string' ||
        typeof rule.label !== 'string'
      ) {
        return;
      }
      incomingRules.push({
        id: rule.id,
        label: rule.label,
        minLength:
          typeof rule.minLength === 'number' ? rule.minLength : undefined,
        pattern: typeof rule.pattern === 'string' ? rule.pattern : undefined,
      });
    });
  }

  return {
    ...flags,
    rules: incomingRules.length > 0 ? incomingRules : buildPasswordRules(flags),
  };
}

export function mergeResetPasswordConfig(
  incoming?: unknown,
): ResetPasswordConfig {
  const raw = asRecord(incoming) ?? {};
  const base = DEFAULT_RESET_PASSWORD_CONFIG;

  return {
    kicker: asString(raw.kicker, base.kicker),
    title: asString(raw.title, base.title),
    subtitle: asString(raw.subtitle, base.subtitle),
    accountLabel: asString(raw.accountLabel, base.accountLabel),
    passwordLabel: asString(raw.passwordLabel, base.passwordLabel),
    passwordPlaceholder: asString(
      raw.passwordPlaceholder,
      base.passwordPlaceholder,
    ),
    confirmLabel: asString(raw.confirmLabel, base.confirmLabel),
    confirmPlaceholder: asString(
      raw.confirmPlaceholder,
      base.confirmPlaceholder,
    ),
    rulesTitle: asString(raw.rulesTitle, base.rulesTitle),
    matchLabel: asString(raw.matchLabel, base.matchLabel),
    backLabel: asString(raw.backLabel, base.backLabel),
    saveLabel: asString(raw.saveLabel, base.saveLabel),
    savingLabel: asString(raw.savingLabel, base.savingLabel),
    copyright: asString(raw.copyright, base.copyright),
    emptyPassword: asString(raw.emptyPassword, base.emptyPassword),
    weakPassword: asString(raw.weakPassword, base.weakPassword),
    emptyConfirm: asString(raw.emptyConfirm, base.emptyConfirm),
    mismatch: asString(raw.mismatch, base.mismatch),
    saveErrorTitle: asString(raw.saveErrorTitle, base.saveErrorTitle),
    strengthLabels:
      Array.isArray(raw.strengthLabels) &&
      raw.strengthLabels.every(item => typeof item === 'string') &&
      raw.strengthLabels.length > 0
        ? (raw.strengthLabels as string[])
        : base.strengthLabels,
    policy: mergePasswordPolicy(raw.policy ?? incoming),
  };
}

export function evaluatePasswordRule(
  value: string,
  rule: PasswordRule,
  policy: PasswordPolicy,
): boolean {
  if (typeof rule.minLength === 'number') {
    return value.length >= rule.minLength;
  }
  if (rule.pattern) {
    try {
      return new RegExp(rule.pattern).test(value);
    } catch {
      return false;
    }
  }

  switch (rule.id) {
    case 'length':
      return value.length >= policy.minLength;
    case 'upper':
      return /[A-Z]/.test(value);
    case 'lower':
      return /[a-z]/.test(value);
    case 'number':
      return /\d/.test(value);
    case 'special':
      return new RegExp(`[${escapeCharClass(policy.specialChars)}]`).test(
        value,
      );
    default:
      return true;
  }
}

export function passwordMeetsPolicy(
  value: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): boolean {
  if (!value) {
    return false;
  }
  return policy.rules.every(rule => evaluatePasswordRule(value, rule, policy));
}

export function getPasswordStrength(
  value: string,
  policy: PasswordPolicy,
  labels: string[] = DEFAULT_RESET_PASSWORD_CONFIG.strengthLabels,
): {score: number; label: string; metCount: number; total: number} {
  const total = Math.max(1, policy.rules.length);
  const metCount = policy.rules.filter(rule =>
    evaluatePasswordRule(value, rule, policy),
  ).length;

  if (!value) {
    return {score: 0, label: '', metCount: 0, total};
  }

  const score = Math.max(1, Math.min(4, Math.round((metCount / total) * 4)));
  const label = labels[score - 1] ?? labels[labels.length - 1] ?? '';
  return {score, label, metCount, total};
}

export function isStrongPassword(
  value: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): boolean {
  return passwordMeetsPolicy(value, policy);
}

export const IDLE_MINUTE_PRESETS = [15, 30, 60, 120] as const;

export function splitName(name: string): {firstName: string; lastName: string} {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return {firstName: '', lastName: ''};
  }
  if (parts.length === 1) {
    return {firstName: parts[0], lastName: ''};
  }
  return {firstName: parts[0], lastName: parts.slice(1).join(' ')};
}

export function displayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function nextAssignmentId(): string {
  return `asg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyAssignment(portalId = ''): UserAccessAssignment {
  return {id: nextAssignmentId(), portalId, role: ''};
}

export function emptyUserForm(defaultPortalId = ''): UserFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    mobileCode: '+1',
    idleMinutes: 15,
    isAdjuster: false,
    isSupervisor: false,
    assignments: [emptyAssignment(defaultPortalId)],
  };
}

export function formFromUser(
  user?: AppUser | null,
  defaultPortalId = '',
): UserFormValues {
  if (!user) {
    return emptyUserForm(defaultPortalId);
  }

  const names =
    user.firstName || user.lastName
      ? {firstName: user.firstName ?? '', lastName: user.lastName ?? ''}
      : splitName(user.name);

  return {
    firstName: names.firstName,
    lastName: names.lastName,
    email: user.email,
    mobile: user.mobile ?? '',
    mobileCode: user.mobileCode ?? '+1',
    idleMinutes: user.idleMinutes ?? 15,
    isAdjuster: user.isAdjuster ?? user.userType === 'Adjuster',
    isSupervisor: user.isSupervisor ?? user.userType === 'Supervisor',
    assignments:
      user.assignments && user.assignments.length > 0
        ? user.assignments
        : [
            {
              id: nextAssignmentId(),
              portalId: user.portalId || defaultPortalId,
              role: user.role,
            },
          ],
  };
}
