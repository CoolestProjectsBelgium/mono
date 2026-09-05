const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function getApiBaseUrl(): string {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    throw new Error('API_BASE_URL environment variable is not set');
  }
  return apiBase.replace(/\/$/, '');
}

export function getCookieHeader(request: unknown): string | undefined {
  const req = request as {
    headers?: { cookie?: string };
    _req?: { headers?: { cookie?: string } };
  };
  return req.headers?.cookie ?? req._req?.headers?.cookie;
}

export function parseSetCookieHeaders(setCookieHeaders: string[]): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const header of setCookieHeaders) {
    const [pair] = header.split(';');
    const eqIndex = pair.indexOf('=');
    if (eqIndex <= 0) {
      continue;
    }
    cookies[pair.slice(0, eqIndex).trim()] = pair.slice(eqIndex + 1).trim();
  }
  return cookies;
}

export function mergeCookieHeader(
  cookieHeader: string | undefined,
  extraCookies: Record<string, string>,
): string {
  const cookies: Record<string, string> = { ...extraCookies };
  if (cookieHeader) {
    for (const part of cookieHeader.split(';')) {
      const trimmed = part.trim();
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex <= 0) {
        continue;
      }
      cookies[trimmed.slice(0, eqIndex)] = trimmed.slice(eqIndex + 1);
    }
  }
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

export function isUnsafeMethod(method: string): boolean {
  return UNSAFE_METHODS.has(method.toUpperCase());
}

export interface NestFetchOptions {
  method?: string;
  body?: unknown;
  cookieHeader?: string;
}

export async function nestFetch(path: string, options: NestFetchOptions = {}): Promise<Response> {
  const apiBase = getApiBaseUrl();
  const method = (options.method ?? 'GET').toUpperCase();
  let cookieHeader = options.cookieHeader;

  if (isUnsafeMethod(method)) {
    const csrfResponse = await fetch(`${apiBase}/csrf-token`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    if (!csrfResponse.ok) {
      return csrfResponse;
    }

    const csrfData = (await csrfResponse.json()) as { csrfToken: string };
    const setCookieHeaders =
      typeof csrfResponse.headers.getSetCookie === 'function'
        ? csrfResponse.headers.getSetCookie()
        : [];
    cookieHeader = mergeCookieHeader(cookieHeader, parseSetCookieHeaders(setCookieHeaders));

    const headers: Record<string, string> = {
      Cookie: cookieHeader,
      'Content-Type': 'application/json',
      'x-csrf-token': csrfData.csrfToken,
    };

    return fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  }

  return fetch(`${apiBase}${path}`, {
    method,
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });
}

export async function parseNestJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (typeof body.message === 'string') {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      }
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
