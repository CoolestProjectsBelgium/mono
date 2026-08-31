export function envFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export type SequelizeSyncOptions = {
  synchronize: boolean;
  sync?: { alter: true };
};

/**
 * Level27 test/prod use NODE_ENV=production but still need schema updates when
 * DB_SYNC_ALTER=true. Dev Container uses DB_SYNCHRONIZE=true (or non-production NODE_ENV).
 */
export function buildSequelizeSyncOptions(
  env: NodeJS.ProcessEnv = process.env,
): SequelizeSyncOptions {
  const syncAlter = envFlag(env.DB_SYNC_ALTER);
  const synchronize =
    syncAlter ||
    envFlag(env.DB_SYNCHRONIZE) ||
    env.NODE_ENV !== 'production';

  return {
    synchronize,
    ...(syncAlter ? { sync: { alter: true } } : {}),
  };
}
