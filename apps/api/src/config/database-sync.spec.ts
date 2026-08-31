import { buildSequelizeSyncOptions, envFlag } from './database-sync';

describe('envFlag', () => {
  it.each(['true', 'TRUE', '1', 'yes'])('treats %s as true', (value) => {
    expect(envFlag(value)).toBe(true);
  });

  it.each([undefined, '', 'false', '0'])('treats %s as false', (value) => {
    expect(envFlag(value)).toBe(false);
  });
});

describe('buildSequelizeSyncOptions', () => {
  it('enables alter when DB_SYNC_ALTER is set on production', () => {
    expect(
      buildSequelizeSyncOptions({
        NODE_ENV: 'production',
        DB_SYNC_ALTER: 'true',
      }),
    ).toEqual({
      synchronize: true,
      sync: { alter: true },
    });
  });

  it('enables synchronize without alter in development', () => {
    expect(
      buildSequelizeSyncOptions({
        NODE_ENV: 'development',
      }),
    ).toEqual({
      synchronize: true,
    });
  });

  it('disables synchronize on production without flags', () => {
    expect(
      buildSequelizeSyncOptions({
        NODE_ENV: 'production',
      }),
    ).toEqual({
      synchronize: false,
    });
  });

  it('enables synchronize via DB_SYNCHRONIZE in dev container', () => {
    expect(
      buildSequelizeSyncOptions({
        NODE_ENV: 'production',
        DB_SYNCHRONIZE: 'true',
      }),
    ).toEqual({
      synchronize: true,
    });
  });
});
