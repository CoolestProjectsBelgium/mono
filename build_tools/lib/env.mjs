const PLACEHOLDER = /^(?:CHANGE_ME)?$/;

/**
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseEnv(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/**
 * @param {Record<string, string>} env
 */
export function stringifyEnv(env) {
  return `${Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
}

/**
 * @param {Record<string, string>} example
 * @param {Record<string, string>} secrets
 */
export function mergeEnv(example, secrets) {
  return { ...example, ...secrets };
}

/**
 * @param {Record<string, string>} env
 * @param {string[]} requiredKeys
 * @returns {string[]}
 */
export function missingRequired(env, requiredKeys) {
  return requiredKeys.filter((key) => {
    const value = env[key];
    return value == null || PLACEHOLDER.test(value.trim());
  });
}
