import { buildAppCookieOptions } from './cookie-options';

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
    process.env.NODE_ENV = 'production';
    expect(buildAppCookieOptions({ secure: false })).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('uses SameSite=none and a leading-dot domain in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.COOKIE_DOMAIN = 'coolestproject.com';
    expect(buildAppCookieOptions({ secure: true })).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      domain: '.coolestproject.com',
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });

  it('uses SameSite=none without Domain on *.localhost dev', () => {
    process.env.COOKIE_DOMAIN = 'coolestprojects.localhost';
    expect(buildAppCookieOptions({ secure: false })).toEqual({
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
    expect(buildAppCookieOptions({ secure: false })).toEqual({
      httpOnly: true,
      signed: true,
      path: '/',
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });
});
