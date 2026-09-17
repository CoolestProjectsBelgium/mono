/**
 * Resolve the API base URL for the current browser origin.
 * On voting.coolestprojects.localhost, use same-origin requests; the TLS proxy and
 * Nitro server routes forward API paths to the Nest API (avoids cross-origin TLS/CORS).
 */
export function resolveApiBase(configuredBase: string): string {
  const trimmed = configuredBase.replace(/\/$/, '')

  if (!import.meta.client) {
    return trimmed
  }

  const { hostname, protocol, port } = window.location
  if (hostname === 'voting.coolestprojects.localhost') {
    return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`
  }

  return trimmed
}
