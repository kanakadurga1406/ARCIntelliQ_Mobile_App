import type {
  AuthLanding,
  AuthSession,
  ClaimHandlerUser,
  LoginCredentials,
  OtpChallenge,
  PasswordResetRequest,
  PasswordResetResult,
  ResendOtpPayload,
  VerifyOtpPayload,
} from '../types/auth';
import {
  API_BASE_URL,
  FORGOT_PASSWORD_URL,
  LOGIN_API_URL,
  LOGIN_PAGE_URL,
  LOGIN_URL,
  OTP_RESEND_URL,
  OTP_URL,
} from './config';
import {
  ApiError,
  extractCsrfToken,
  readMessage,
  siteRequest,
} from './client';
import {clearBusinessCache} from './business';
import {clearCookies, getCookie} from './cookies';
import {clearPendingOtp, getPendingOtp, setPendingOtp} from './session';

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHtmlError(html: string): string | null {
  const patterns = [
    /id="emailError"[^>]*>\s*([^<]+)/i,
    /id="passwordError"[^>]*>\s*([^<]+)/i,
    /class="[^"]*field-error[^"]*"[^>]*>\s*([^<]+)/i,
    /class="[^"]*invalid-feedback[^"]*"[^>]*>\s*([^<]+)/i,
    /class="[^"]*alert-danger[^"]*"[^>]*>\s*([\s\S]*?)<\/div>/i,
    /(These credentials do not match[^.<]*)/i,
    /(The provided credentials[^.<]*)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const text = match?.[1]
      ? decodeEntities(match[1].replace(/<[^>]+>/g, ''))
      : '';
    if (text) {
      return text;
    }
  }

  return null;
}

function looksLikeOtpPage(html: string, url: string): boolean {
  return (
    /otp-box|auth-panel--otp|name="otp"|id="otpForm"|two-factor|verify.?otp/i.test(
      html,
    ) || /otp|two-factor|verify/i.test(url)
  );
}

function looksLikeLoginForm(html: string): boolean {
  return /id="loginForm"/i.test(html) && /name="password"/i.test(html);
}

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

function extractUserId(data: unknown, raw = '', url = ''): string {
  const root = asRecord(data);
  const nested = asRecord(root?.data) || root;
  const user = asRecord(nested?.user) || asRecord(root?.user);

  const fromJson = readString(
    root?.user_id,
    nested?.user_id,
    user?.user_id,
    root?.userId,
    nested?.userId,
    user?.id,
  );
  if (fromJson) {
    return fromJson;
  }

  const fromRaw = raw.match(/"user_id"\s*:\s*"?(\d+)"?/i);
  if (fromRaw?.[1]) {
    return fromRaw[1];
  }

  try {
    const parsed = new URL(url);
    const fromQuery =
      parsed.searchParams.get('user_id') ||
      parsed.searchParams.get('userId') ||
      parsed.searchParams.get('id');
    if (fromQuery?.trim()) {
      return fromQuery.trim();
    }
    const fromPath = parsed.pathname.match(
      /\/(?:user|users|otp|verify)\/(\d+)/i,
    );
    if (fromPath?.[1]) {
      return fromPath[1];
    }
  } catch {
    // Ignore invalid URLs.
  }

  const fromHtml =
    raw.match(/name=["']user_id["'][^>]*value=["']([^"']+)["']/i) ||
    raw.match(/value=["']([^"']+)["'][^>]*name=["']user_id["']/i) ||
    raw.match(/data-user-id=["']([^"']+)["']/i);

  return fromHtml?.[1] || '';
}

async function fetchJsonUserId(
  email: string,
  password: string,
  webResult: {
    json: unknown;
    raw: string;
    url: string;
  },
): Promise<string> {
  let userId = extractUserId(webResult.json, webResult.raw, webResult.url);
  if (userId) {
    return userId;
  }

  if (webResult.url && webResult.url !== LOGIN_URL) {
    const landed = await siteRequest(webResult.url);
    userId = extractUserId(landed.json, landed.raw, landed.url);
    if (userId) {
      return userId;
    }
  }

  const mobileLogin = await siteRequest(LOGIN_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  console.log('[ARC login] mobile status', mobileLogin.status);
  console.log('[ARC login] mobile json', mobileLogin.json);
  userId = extractUserId(mobileLogin.json, mobileLogin.raw, mobileLogin.url);
  if (userId) {
    return userId;
  }

  for (const path of ['/user', '/me', '/profile']) {
    const page = await siteRequest(`${API_BASE_URL}${path}`, {
      headers: {Accept: 'application/json'},
    });
    userId = extractUserId(page.json, page.raw, page.url);
    if (userId) {
      return userId;
    }
  }

  return '';
}

function toUserRole(value: unknown): ClaimHandlerUser['role'] {
  const raw = readString(value).toLowerCase();
  if (raw.includes('claimant')) {
    return 'claimant';
  }
  if (raw.includes('contractor')) {
    return 'contractor';
  }
  return 'claim-handler';
}

function readBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 1 || value === '1' || value === 'true') {
      return true;
    }
  }
  return false;
}

function toAuthLanding(data: unknown): AuthLanding {
  const root = asRecord(data) || {};
  const nested = asRecord(root.data) || root;
  const landing = asRecord(nested.landing) || asRecord(root.landing) || {};
  const business = asRecord(landing.business);

  return {
    showClaimPortals: readBoolean(
      landing.show_claim_portals,
      landing.showClaimPortals,
    ),
    autoEnter: readBoolean(landing.auto_enter, landing.autoEnter),
    portalCount: Number(landing.portal_count ?? landing.portalCount ?? 0) || 0,
    businessId: readString(
      landing.business_id,
      landing.businessId,
      business?.id,
      business?.business_id,
    ),
    businessName: readString(
      landing.business_name,
      landing.businessName,
      business?.name,
      business?.business_name,
    ),
  };
}

function toAuthSession(data: unknown, fallbackEmail: string): AuthSession {
  const root = asRecord(data) || {};
  const nested = asRecord(root.data) || root;
  const userRaw = asRecord(nested.user) || asRecord(root.user) || nested;
  const email = readString(userRaw.email, nested.email, root.email, fallbackEmail);
  const firstName = readString(userRaw.first_name, userRaw.firstName);
  const lastName = readString(userRaw.last_name, userRaw.lastName);
  const token = readString(
    nested.token,
    nested.access_token,
    root.token,
    root.access_token,
    getCookie('laravel-session'),
  );
  const title = userRaw.is_super_admin
    ? 'Super Admin'
    : userRaw.is_business_admin
      ? 'Business Admin'
      : readString(
          userRaw.title,
          userRaw.designation,
          nested.title,
          'Claim Handler',
        );

  return {
    token,
    user: {
      id:
        readString(userRaw.id, userRaw.user_id, nested.user_id, root.user_id) ||
        'user',
      name: readString(
        userRaw.name,
        userRaw.full_name,
        [firstName, lastName].filter(Boolean).join(' '),
        nested.name,
        email,
      ),
      email,
      role: toUserRole(userRaw.role || nested.role || root.role),
      title,
    },
    landing: toAuthLanding(data),
  };
}

export async function startClaimHandlerLogin(
  credentials: LoginCredentials,
): Promise<OtpChallenge> {
  clearCookies();
  clearPendingOtp();
  clearBusinessCache();

  const page = await siteRequest(LOGIN_PAGE_URL);
  const csrf = extractCsrfToken(page.html);
  const email = credentials.email.trim();

  const body = new URLSearchParams({
    _token: csrf,
    portal: 'unified',
    email,
    password: credentials.password,
  });
  if (credentials.remember) {
    body.set('remember', '1');
  }

  const result = await siteRequest(LOGIN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-TOKEN': csrf,
      Origin: LOGIN_URL.replace(/\/login$/, ''),
      Referer: LOGIN_PAGE_URL,
    },
    body: body.toString(),
  });

  console.log('[ARC login] status', result.status);
  console.log('[ARC login] contentType', result.contentType);
  console.log('[ARC login] finalUrl', result.url);
  console.log('[ARC login] json', result.json);
  console.log(
    '[ARC login] raw',
    result.raw ? result.raw.slice(0, 800) : '(empty body)',
  );

  if (result.status >= 400) {
    throw new ApiError(
      result.json
        ? readMessage(result.json, 'Invalid email or password')
        : extractHtmlError(result.html) || 'Invalid email or password',
      result.status,
      result.json,
    );
  }

  if (result.html && looksLikeLoginForm(result.html)) {
    throw new ApiError(
      extractHtmlError(result.html) || 'Invalid email or password',
      401,
    );
  }

  const userId = await fetchJsonUserId(email, credentials.password, result);
  const resolvedEmail = readString(
    asRecord(result.json)?.email,
    asRecord(asRecord(result.json)?.data)?.email,
    email,
  );
  setPendingOtp({email: resolvedEmail, userId});
  console.log('[ARC login] stored user_id', userId);

  return {
    email: resolvedEmail,
    userId,
    expiresIn: 300,
  };
}

export async function verifyClaimHandlerOtp(
  payload: VerifyOtpPayload,
): Promise<AuthSession> {
  const pending = getPendingOtp();
  const email = payload.email?.trim() || pending?.email || '';
  const userId = String(payload.userId || pending?.userId || '').trim();
  const otp = payload.otp.trim();
  const verifyBody = {
    user_id: /^\d+$/.test(userId) ? Number(userId) : userId,
    otp,
  };

  console.log('[ARC otp] verify payload', verifyBody);

  const result = await siteRequest(OTP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verifyBody),
  });

  console.log('[ARC otp] verify status', result.status);
  console.log('[ARC otp] verify contentType', result.contentType);
  console.log('[ARC otp] verify url', result.url);
  console.log('[ARC otp] verify json', result.json);
  console.log(
    '[ARC otp] verify raw',
    result.raw ? result.raw.slice(0, 800) : '(empty body)',
  );

  if (result.status >= 400) {
    throw new ApiError(
      result.json
        ? readMessage(result.json, 'Invalid verification code')
        : extractHtmlError(result.html) || 'Invalid verification code',
      result.status,
      result.json,
    );
  }

  if (result.json) {
    const session = toAuthSession(result.json, email);
    console.log('[ARC otp] stored token', session.token ? '(present)' : '(empty)');
    console.log('[ARC otp] landing', session.landing);
    clearPendingOtp();
    return session;
  }

  if (looksLikeOtpPage(result.html, result.url)) {
    throw new ApiError(
      extractHtmlError(result.html) || 'Invalid verification code',
      401,
    );
  }

  clearPendingOtp();
  return toAuthSession({}, email);
}

export async function resendClaimHandlerOtp(
  payload: ResendOtpPayload,
): Promise<OtpChallenge> {
  const pending = getPendingOtp();
  const email = payload.email?.trim() || pending?.email || '';
  const userId = String(payload.userId || pending?.userId || '').trim();

  const result = await siteRequest(OTP_RESEND_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      email,
    }),
  });

  console.log('[ARC otp] resend status', result.status);
  console.log('[ARC otp] resend json', result.json);
  console.log(
    '[ARC otp] resend raw',
    result.raw ? result.raw.slice(0, 800) : '(empty body)',
  );

  if (result.status >= 400) {
    throw new ApiError(
      result.json
        ? readMessage(result.json, 'Unable to resend the code.')
        : extractHtmlError(result.html) || 'Unable to resend the code.',
      result.status,
      result.json,
    );
  }

  const body = asRecord(result.json);
  const next = {
    email: readString(body?.email, email),
    userId: readString(body?.user_id, body?.userId, userId),
    expiresIn: Number(body?.expiresIn) || 300,
  };
  setPendingOtp(next);
  return next;
}

export async function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<PasswordResetResult> {
  const page = await siteRequest(FORGOT_PASSWORD_URL);
  const csrf = extractCsrfToken(page.html);
  const result = await siteRequest(FORGOT_PASSWORD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-TOKEN': csrf,
    },
    body: new URLSearchParams({
      _token: csrf,
      email: payload.email.trim(),
    }).toString(),
  });

  if (result.status >= 400) {
    throw new ApiError(
      result.json
        ? readMessage(result.json, 'Unable to send the reset link.')
        : extractHtmlError(result.html) || 'Unable to send the reset link.',
      result.status,
      result.json,
    );
  }

  return {
    message:
      readString(asRecord(result.json)?.message) ||
      'If that email is on an ARCIntelliQ account, a set-password link is on its way.',
  };
}