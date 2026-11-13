import { ConfigService } from '@nestjs/config';
import { buildAppCookieOptions, clearLegacyJwtCookies } from './cookie-options';

function mockConfig(
  values: Record<string, string | undefined> = {},
): ConfigService {
  return {
    get: (key: string) => values[key],
  } as ConfigService;
}

describe('buildAppCookieOptions', () => {
  // Stub the real process.env rather than replacing the object:
  // bootstrap-security.ts reads CORS_ORIGINS through `import { env } from
  // 'process'`, which stays bound to the original object. Replacing
  // process.env made these tests depend on the Dev Container's own
  // CORS_ORIGINS and fail on CI, where it is unset.
  beforeEach(() => {
    vi.stubEnv('COOKIE_DOMAIN', undefined);
    vi.stubEnv('CORS_ORIGINS', undefined);
    vi.stubEnv('NODE_ENV', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses SameSite=lax without a shared cookie domain in production', () => {
    expect(
      buildAppCookieOptions(mockConfig({ enviroment: 'production' }), {
        secure: false,
      }),
    ).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('does not use NODE_ENV as the cookie Domain', () => {
    const options = buildAppCookieOptions(
      mockConfig({ enviroment: 'production' }),
      { secure: true },
    );
    expect(options.domain).toBeUndefined();
  });

  it('uses SameSite=none and a leading-dot domain from COOKIE_DOMAIN', () => {
    expect(
      buildAppCookieOptions(
        mockConfig({
          enviroment: 'production',
          'cookies.domain': 'coolestprojects-test.be',
        }),
        { secure: true },
      ),
    ).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      domain: '.coolestprojects-test.be',
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('uses SameSite=none without Domain on *.localhost dev', () => {
    expect(
      buildAppCookieOptions(
        mockConfig({ 'cookies.domain': 'coolestprojects.localhost' }),
        { secure: false },
      ),
    ).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('uses SameSite=none in non-production when CORS includes localhost', () => {
    vi.stubEnv(
      'CORS_ORIGINS',
      'https://registration.coolestprojects.localhost:8443',
    );
    expect(
      buildAppCookieOptions(mockConfig({ enviroment: 'development' }), {
        secure: false,
      }),
    ).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });
});

describe('clearLegacyJwtCookies', () => {
  it('does not expire the live shared-domain jwt in the same response', () => {
    const clearCookie = vi.fn();
    clearLegacyJwtCookies(
      mockConfig({
        enviroment: 'production',
        'cookies.domain': 'coolestprojects-test.be',
      }),
      { clearCookie },
      { secure: true },
    );
    expect(clearCookie).not.toHaveBeenCalled();
  });

  it('skips localhost cookie domains', () => {
    const clearCookie = vi.fn();
    clearLegacyJwtCookies(
      mockConfig({ 'cookies.domain': 'coolestprojects.localhost' }),
      { clearCookie },
      { secure: true },
    );
    expect(clearCookie).not.toHaveBeenCalled();
  });
});
