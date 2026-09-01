/**
 * Resolve the API base URL for the current browser origin.
 * Port-forward users on http://localhost:3005 must call the API on localhost:3001.
 * On voting.coolestprojects.localhost, use same-origin requests; the TLS proxy and
 * Nitro server routes forward API paths to the Nest API (avoids cross-origin TLS/CORS).
 */
export function resolveApiBase(configuredBase: string): string {
  const trimmed = configuredBase.replace(/\/$/, '')

  if (!import.meta.client) {
    return trimmed
  }

  const { hostname, protocol, port } = window.location
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3001`
  }

  if (hostname === 'voting.coolestprojects.localhost') {
    return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`
  }

  return trimmed
}
