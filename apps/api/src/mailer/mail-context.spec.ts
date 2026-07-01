import {
  baseUrlWithLanguage,
  buildLoginUrl,
  registrationAppUrl,
} from './mail-context';

describe('mail-context', () => {
  const base = 'https://registration.coolestprojects.localhost:8443';

  it('baseUrlWithLanguage keeps nl without prefix', () => {
    expect(baseUrlWithLanguage(base, 'nl')).toBe(base);
  });

  it('baseUrlWithLanguage adds language prefix for en and fr', () => {
    expect(baseUrlWithLanguage(base, 'en')).toBe(`${base}/en`);
    expect(baseUrlWithLanguage(base, 'fr')).toBe(`${base}/fr`);
  });

  it('buildLoginUrl includes encoded token', () => {
    const url = buildLoginUrl(base, 'nl', 'abc+token/value');
    expect(url).toBe(
      `${base}/login?token=${encodeURIComponent('abc+token/value')}`,
    );
  });

  it('buildLoginUrl uses locale prefix for non-nl languages', () => {
    expect(buildLoginUrl(base, 'en', 'jwt')).toBe(`${base}/en/login?token=jwt`);
  });

  it('registrationAppUrl falls back to dev default', () => {
    delete process.env.REGISTRATION_URL;
    expect(registrationAppUrl()).toBe(
      'https://registration.coolestprojects.localhost:8443',
    );
  });
});
