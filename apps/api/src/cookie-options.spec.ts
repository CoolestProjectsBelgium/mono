import { ConfigService } from '@nestjs/config';
import { buildAppCookieOptions } from './cookie-options';

function mockConfig(values: Record<string, string | undefined> = {}): ConfigService {
  return {
    get: (key: string) => values[key],
  } as ConfigService;
}

describe('buildAppCookieOptions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.COOKIE_DOMAIN;
    delete process.env.CORS_ORIGINS;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses SameSite=lax without a shared cookie domain in production', () => {
    expect(buildAppCookieOptions(mockConfig({ enviroment: 'production' }), { secure: false })).toEqual({
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
    process.env.CORS_ORIGINS = 'https://registration.coolestprojects.localhost:8443';
    expect(buildAppCookieOptions(mockConfig({ enviroment: 'development' }), { secure: false })).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });
});
