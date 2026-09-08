const cookies = new Map<string, string>();

function splitSetCookie(header: string): string[] {
  return header.split(/,(?=\s*[A-Za-z0-9_!#$%&*.~+-]+=)/);
}

export function storeResponseCookies(headers: Headers): void {
  const withSetCookie = headers as Headers & {getSetCookie?: () => string[]};
  const raw =
    typeof withSetCookie.getSetCookie === 'function'
      ? withSetCookie.getSetCookie()
      : [];
  const fallback = headers.get('set-cookie');
  const parts = raw.length > 0 ? raw : fallback ? splitSetCookie(fallback) : [];

  parts.forEach(part => {
    const pair = part.split(';')[0];
    const eq = pair.indexOf('=');
    if (eq <= 0) {
      return;
    }
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (name) {
      cookies.set(name, value);
    }
  });
}

export function getCookieHeader(): string {
  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

export function getCookie(name: string): string | undefined {
  return cookies.get(name);
}

export function clearCookies(): void {
  cookies.clear();
}
