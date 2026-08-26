/**
 * Resolve the API base URL for the current browser origin.
 * Port-forward users on http://localhost:3004 must call the API on localhost:3001
 * so auth cookies stay same-site. Proxy users keep API_BASE_URL.
 */
export function resolveApiBase(configuredBase: string): string {
  const trimmed = configuredBase.replace(/\/$/, '')

  if (!import.meta.client) {
    return trimmed
  }

  const { hostname, protocol } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001`
  }

  return trimmed
}
