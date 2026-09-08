import {API_BASE_URL} from './config';
import {getCookie, getCookieHeader, storeResponseCookies} from './cookies';
import {getSession} from './session';

const BASE_URL = API_BASE_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function toUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

function readMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const body = data as {
    message?: unknown;
    error?: unknown;
    errors?: unknown;
  };

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }
  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }
  if (body.errors && typeof body.errors === 'object') {
    const messages = Object.values(body.errors)
      .flat()
      .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return fallback;
}

function withSessionHeaders(
  extra?: RequestInit['headers'],
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json, text/html;q=0.9',
    'X-Requested-With': 'XMLHttpRequest',
    ...(extra as Record<string, string> | undefined),
  };

  const cookie = getCookieHeader();
  if (cookie) {
    headers.Cookie = cookie;
  }

  const xsrf = getCookie('XSRF-TOKEN');
  if (xsrf) {
    headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrf);
  }

  return headers;
}

export type SiteResponse = {
  status: number;
  url: string;
  html: string;
  raw: string;
  json: unknown;
  contentType: string;
};

function parseJsonBody(text: string): unknown {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function siteRequest(
  url: string,
  options: RequestInit = {},
): Promise<SiteResponse> {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: withSessionHeaders(options.headers),
  });

  storeResponseCookies(response.headers);
  const raw = await response.text();
  const json = parseJsonBody(raw);

  return {
    status: response.status,
    url: response.url || url,
    html: json ? '' : raw,
    raw,
    json,
    contentType: response.headers.get('content-type') || '',
  };
}

export function extractCsrfToken(html: string): string {
  const meta = html.match(/name="csrf-token"\s+content="([^"]+)"/i);
  if (meta?.[1]) {
    return meta[1];
  }

  const hidden = html.match(/name="_token"\s+value="([^"]+)"/i);
  if (hidden?.[1]) {
    return hidden[1];
  }

  throw new ApiError('Unable to start a secure sign-in session.', 500);
}

export {readMessage};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getSession()?.token;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const cookie = getCookieHeader();
  if (cookie) {
    headers.Cookie = cookie;
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(toUrl(path), {
    credentials: 'include',
    ...options,
    headers,
  });

  storeResponseCookies(response.headers);

  const data = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw new ApiError(
      readMessage(data, 'Request failed'),
      response.status,
      data,
    );
  }

  return data;
}
