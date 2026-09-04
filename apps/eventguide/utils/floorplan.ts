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
