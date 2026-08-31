export const SMOKE_OK_CODES = new Set(['200', '301', '302']);
export const SMOKE_DEFAULT_ATTEMPTS = 12;
export const SMOKE_DEFAULT_INTERVAL_MS = 5000;
export const SMOKE_INITIAL_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {{ publicUrl: string, smokePath: string }} target
 * @returns {string}
 */
export function buildSmokeUrl(target) {
  if (!target.publicUrl) {
    throw new Error('Smoke check requires publicUrl on the deploy target.');
  }
  const base = target.publicUrl.replace(/\/$/, '');
  const smokePath = target.smokePath.startsWith('/') ? target.smokePath : `/${target.smokePath}`;
  return `${base}${smokePath}`;
}

/**
 * @param {string} url
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<string | null>}
 */
export async function probeUrl(url, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(url, { redirect: 'manual' });
    return String(response.status);
  } catch {
    return null;
  }
}

/**
 * Poll the component public URL until it responds or attempts are exhausted.
 * Level27 Node apps listen inside a network namespace (IP_NS), so SSH
 * localhost probes against 127.0.0.1 never reach the process.
 *
 * @param {{ publicUrl: string, smokePath: string }} target
 * @param {{ attempts?: number, intervalMs?: number, initialDelayMs?: number, sleep?: (ms: number) => Promise<void>, fetchImpl?: typeof fetch }} [options]
 */
export async function smokePublicUrl(target, options = {}) {
  const attempts = options.attempts ?? SMOKE_DEFAULT_ATTEMPTS;
  const intervalMs = options.intervalMs ?? SMOKE_DEFAULT_INTERVAL_MS;
  const initialDelayMs = options.initialDelayMs ?? SMOKE_INITIAL_DELAY_MS;
  const sleepImpl = options.sleep ?? sleep;
  const fetchImpl = options.fetchImpl ?? fetch;
  const url = buildSmokeUrl(target);

  await sleepImpl(initialDelayMs);

  let lastCode = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const code = await probeUrl(url, fetchImpl);
    lastCode = code;
    if (code && SMOKE_OK_CODES.has(code)) {
      if (attempt > 1) {
        process.stdout.write(`Smoke check passed (${code}) on attempt ${attempt}/${attempts}\n`);
      }
      return code;
    }
    if (attempt < attempts) {
      process.stdout.write(
        `Smoke check waiting for ${url} (attempt ${attempt}/${attempts}, got ${code ?? 'no response'})\n`,
      );
      await sleepImpl(intervalMs);
    }
  }

  throw new Error(
    `Smoke check failed: ${url} did not return 200/301/302 after ${attempts} attempts (last: ${lastCode ?? 'no response'})`,
  );
}
