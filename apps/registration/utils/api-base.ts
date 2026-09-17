/**
 * Resolve the API base URL for the current browser origin.
 */
export function resolveApiBase(configuredBase: string): string {
  return configuredBase.replace(/\/$/, '')
}
