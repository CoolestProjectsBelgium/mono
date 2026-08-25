import { missingRequired, mergeEnv, parseEnv, stringifyEnv } from './env.mjs';

/**
 * @typedef {object} BootstrapInput
 * @property {boolean} remoteExists
 * @property {string | null} exampleText
 * @property {string | null} secretsText
 * @property {string[]} requiredKeys
 * @property {string} secretsPath
 */

/**
 * First-time only: if remote `.env` is missing, merge example + secrets.
 * Never overwrite an existing remote file.
 *
 * @param {BootstrapInput} input
 */
export function planEnvBootstrap(input) {
  if (input.remoteExists) {
    return { action: 'skip' };
  }

  if (!input.secretsText) {
    throw new Error(
      `Remote .env is missing. Create ${input.secretsPath} (gitignored) and retry.`,
    );
  }

  if (!input.exampleText) {
    throw new Error('Missing committed env example for this app/env.');
  }

  const merged = mergeEnv(parseEnv(input.exampleText), parseEnv(input.secretsText));
  const missing = missingRequired(merged, input.requiredKeys);
  if (missing.length > 0) {
    throw new Error(
      `First-time .env is missing required values: ${missing.join(', ')}`,
    );
  }

  return { action: 'create', content: stringifyEnv(merged) };
}
