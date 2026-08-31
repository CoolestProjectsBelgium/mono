import { sshExec } from './ssh.mjs';

export const SMOKE_OK_CODES = new Set(['200', '301', '302']);
export const SMOKE_DEFAULT_ATTEMPTS = 12;
export const SMOKE_DEFAULT_INTERVAL_MS = 5000;
export const SMOKE_INITIAL_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {{ sshUser: string, sshHost: string, port: number, smokePath: string, runImpl?: Function }} input
 * @returns {string | null}
 */
export function probeLocalhost(input) {
  const smokePath = input.smokePath.startsWith('/') ? input.smokePath : `/${input.smokePath}`;
  const command = `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${input.port}${smokePath}`;
  try {
    const result = sshExec({ ...input, command });
    return result.stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Poll localhost over SSH until the app responds or attempts are exhausted.
 *
 * @param {{ sshUser: string, sshHost: string, port: number, smokePath: string, runImpl?: Function }} input
 * @param {{ attempts?: number, intervalMs?: number, initialDelayMs?: number, sleep?: (ms: number) => Promise<void> }} [options]
 */
export async function smokeLocalhost(input, options = {}) {
  const attempts = options.attempts ?? SMOKE_DEFAULT_ATTEMPTS;
  const intervalMs = options.intervalMs ?? SMOKE_DEFAULT_INTERVAL_MS;
  const initialDelayMs = options.initialDelayMs ?? SMOKE_INITIAL_DELAY_MS;
  const sleepImpl = options.sleep ?? sleep;
  const smokePath = input.smokePath.startsWith('/') ? input.smokePath : `/${input.smokePath}`;
  const url = `http://127.0.0.1:${input.port}${smokePath}`;

  await sleepImpl(initialDelayMs);

  let lastCode = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const code = probeLocalhost(input);
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
