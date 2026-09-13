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

function eventguideAssetPath(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return new URL(url).pathname
  }

  return url.startsWith('/') ? url : `/${url}`
}

/**
 * Resolve eventguide asset URLs (thumbnails, etc.) for the current browser origin.
 * The API may return absolute api-host URLs; on the local eventguide proxy host we
 * load them same-origin via /eventguide/* instead.
 */
export function resolveEventguideAssetUrl(
  url: string | null,
  apiBase: string,
): string | null {
  if (!url) {
    return null
  }

  const path = eventguideAssetPath(url)

  if (import.meta.client && window.location.hostname === 'eventguide.coolestprojects.localhost') {
    return path
  }

  const base = apiBase.replace(/\/$/, '')
  return `${base}${path}`
}
