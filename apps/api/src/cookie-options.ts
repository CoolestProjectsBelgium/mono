import type { CookieOptions, Response } from 'express';
import { parseCorsOrigins } from './bootstrap-security';

type CookieRequest = {
  secure?: boolean;
  headers?: Record<string, string | string[] | undefined>;
};

export function buildAppCookieOptions(request: CookieRequest): CookieOptions {
  const secure =
    process.env.NODE_ENV === 'production'
    || request.secure
    || request.headers?.['x-forwarded-proto'] === 'https';

  const rawDomain = process.env.COOKIE_DOMAIN?.trim();
  const isLocalhostDev = Boolean(rawDomain?.endsWith('.localhost'));
  const isNonProduction = process.env.NODE_ENV !== 'production';
  const corsHasLocalhost = parseCorsOrigins().some((origin) =>
    origin.includes('.localhost'),
  );

  // Browsers reject Domain= on *.localhost. Registration and API are different origins,
  // so dev cookies need SameSite=None; Secure (host-only on the API subdomain).
  const sharedDomain = rawDomain && !isLocalhostDev
    ? (rawDomain.startsWith('.') ? rawDomain : `.${rawDomain}`)
    : undefined;
  const crossSite =
    Boolean(sharedDomain)
    || isLocalhostDev
    || (isNonProduction && corsHasLocalhost);

  return {
    httpOnly: true,
    signed: true,
    path: '/',
    secure: crossSite ? true : secure,
    sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(sharedDomain ? { domain: sharedDomain } : {}),
  };
}

/** @deprecated use buildAppCookieOptions */
export const buildUserCookieOptions = buildAppCookieOptions;

export function clearLegacyJwtCookies(
  res: Pick<Response, 'clearCookie'>,
  request: CookieRequest,
): void {
  const base = buildAppCookieOptions(request);
  const rawDomain = process.env.COOKIE_DOMAIN?.trim();
  if (!rawDomain) {
    return;
  }

  // Only clear old shared-domain variants; the new host-only cookie overwrites itself.
  const bare = rawDomain.replace(/^\./, '');
  for (const domain of [`.${bare}`, bare]) {
    res.clearCookie('jwt', {
      signed: true,
      path: base.path,
      domain,
      secure: base.secure,
      sameSite: base.sameSite,
    });
  }
}
