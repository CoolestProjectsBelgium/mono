export function parseTableNumber(name: string | null | undefined): number | null {
  if (!name) {
    return null
  }

  const match = name.match(/(\d+)\s*$/)
  if (!match) {
    return null
  }

  const value = Number.parseInt(match[1], 10)
  return Number.isFinite(value) ? value : null
}

export function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short' }).format(new Date(isoDate))
}

export function buildProjectSearchLabel(
  tableNumber: number | null,
  projectName: string,
  participants: string[],
): string {
  const prefix = tableNumber != null ? `${tableNumber}. ` : ''
  const users = participants.join(', ')
  return users ? `${prefix}${projectName}: ${users}` : `${prefix}${projectName}`
}

export function projectsForMap<T extends { tableNumber: number | null }>(projects: T[]): T[] {
  return projects.filter((project) => project.tableNumber != null)
}

/**
 * Resolve a floor plan URL from the API path returned by EventguideService.
 */
export function resolveFloorplanUrl(
  floorplanPath: string | undefined,
  apiBase: string,
  version?: string | null,
): string {
  const path = floorplanPath || 'eventguide/floorplans/map.svg'
  const cacheSuffix = version ? `?v=${encodeURIComponent(version)}` : ''

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return `${path}${cacheSuffix}`
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Same-origin relative path when the eventguide proxy serves /eventguide/*.
  if (typeof window !== 'undefined' && window.location.hostname === 'eventguide.coolestprojects.localhost') {
    return `${normalizedPath}${cacheSuffix}`
  }

  const base = apiBase.replace(/\/$/, '')
  return `${base}${normalizedPath}${cacheSuffix}`
}

