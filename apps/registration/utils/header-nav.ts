const LOCALE_CODES = ['nl', 'en', 'fr'] as const

const PROJECT_NAV_PATHS = ['/project', '/no_project', '/new_project', '/upload', '/token']

export function stripLocalePrefix(path: string): string {
  const withSlash = path.startsWith('/') ? path : `/${path}`
  const trimmed = withSlash.replace(/\/+$/, '') || '/'
  const segments = trimmed.split('/')
  if (segments.length >= 2 && (LOCALE_CODES as readonly string[]).includes(segments[1])) {
    const rest = `/${segments.slice(2).join('/')}`
    return rest.replace(/\/+$/, '') || '/'
  }
  return trimmed
}

export function isHeaderNavActive(currentPath: string, itemPath: string): boolean {
  const current = stripLocalePrefix(currentPath)
  const item = stripLocalePrefix(itemPath)
  if (item === '/project') {
    return PROJECT_NAV_PATHS.includes(current)
  }
  return current === item
}
