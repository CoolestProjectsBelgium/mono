import configuration from './configuration';

describe('configuration', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  const load = (env: Record<string, string | undefined>) => {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    return configuration();
  };

  it('falls back to default ports when unset or not numeric', () => {
    const config = load({
      DB_PORT: undefined,
      SMTP_PORT: 'abc',
      IMAP_PORT: undefined,
      API_PORT: '',
    });
    expect(config.database.port).toBe(3306);
    expect(config.mailing.port).toBe(1025);
    expect(config.mailing.imap_port).toBe(993);
    expect(config.api.port).toBe(3001);
  });

  it('parses configured ports as numbers', () => {
    const config = load({
      DB_PORT: '3307',
      SMTP_PORT: '587',
      API_PORT: '4000',
    });
    expect(config.database.port).toBe(3307);
    expect(config.mailing.port).toBe(587);
    expect(config.api.port).toBe(4000);
  });

  it('treats empty secrets as missing so getOrThrow fails fast', () => {
    const config = load({ CSRF_SECRET: '', ADMINJS_COOKIE_SECRET: '' });
    expect(config.api.csrf).toBeUndefined();
    expect(config.adminjs.secret).toBeUndefined();
  });

  it('uses the SMTP host for IMAP unless IMAP_HOST is set', () => {
    expect(
      load({ SMTP_HOST: 'smtp.example.be', IMAP_HOST: undefined }).mailing
        .imap_host,
    ).toBe('smtp.example.be');
    expect(
      load({ SMTP_HOST: 'smtp.example.be', IMAP_HOST: 'imap.example.be' })
        .mailing.imap_host,
    ).toBe('imap.example.be');
  });

  it('never enables schema sync in production unless explicitly asked', () => {
    const base = { DB_SYNC_ALTER: undefined, DB_SYNCHRONIZE: undefined };
    expect(load({ ...base, NODE_ENV: 'production' }).database.synchronize).toBe(
      false,
    );
    const altered = load({
      ...base,
      NODE_ENV: 'production',
      DB_SYNC_ALTER: 'true',
    }).database;
    expect(altered.synchronize).toBe(true);
    expect(altered.sync).toEqual({ alter: true });
  });
});
