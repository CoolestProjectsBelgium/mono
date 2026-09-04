/**
 * Resolve the API base URL for the current browser origin.
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

  if (hostname === 'eventguide.coolestprojects.localhost') {
    return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`
  }

  return trimmed
}
