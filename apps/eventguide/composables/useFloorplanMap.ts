import { buildProjectSearchLabel, projectsForMap } from '~/utils/floorplan'
import type { EventguideProject } from '~/types/api'

export interface TableBounds {
  x0: number
  y0: number
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
}

export const FLOORPLAN_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [840, 1188],
]

export function getTableCenter(bounds: TableBounds): { x: number, y: number } {
  const x = (bounds.x0 + bounds.x1 + bounds.x2 + bounds.x3) / 4
  const y = (bounds.y0 + bounds.y1 + bounds.y2 + bounds.y3) / 4
  return { x, y }
}

export function extractTableBounds(
  svgDocument: Document,
  mapHeight: number,
): Record<number, TableBounds> {
  const svg = svgDocument.querySelector('svg')
  if (!svg) {
    return {}
  }

  const coords: Record<number, TableBounds> = {}
  const groups = svgDocument.getElementsByTagName('g')

  for (const part of groups) {
    if (!String(part.id).startsWith('table_')) {
      continue
    }

    const tableNumber = Number.parseInt(part.id.substring(6), 10)
    if (!Number.isFinite(tableNumber)) {
      continue
    }

    const bbox = part.getBBox()
    const matrix = part.getCTM()
    if (!matrix) {
      continue
    }

    const x = bbox.x + (bbox.width / 2)
    const y = bbox.y + (bbox.height / 2)
    const w2 = bbox.width / 2
    const h2 = bbox.height / 2

    coords[tableNumber] = {
      x0: (matrix.a * (x - w2)) + (matrix.c * (y - h2) + matrix.e),
      y0: mapHeight - ((matrix.b * (x - w2)) + (matrix.d * (y - h2) + matrix.f)),
      x1: (matrix.a * (x - w2)) + (matrix.c * (y + h2) + matrix.e),
      y1: mapHeight - ((matrix.b * (x - w2)) + (matrix.d * (y + h2) + matrix.f)),
      x2: (matrix.a * (x + w2)) + (matrix.c * (y + h2) + matrix.e),
      y2: mapHeight - ((matrix.b * (x + w2)) + (matrix.d * (y + h2) + matrix.f)),
      x3: (matrix.a * (x + w2)) + (matrix.c * (y - h2) + matrix.e),
      y3: mapHeight - ((matrix.b * (x + w2)) + (matrix.d * (y - h2) + matrix.f)),
    }
  }

  return coords
}

export function mapProjectsToLayers(
  projects: EventguideProject[],
  tableBounds: Record<number, TableBounds>,
) {
  return projectsForMap(projects)
    .map((project) => {
      const tableNumber = project.tableNumber!
      const bounds = tableBounds[tableNumber]
      if (!bounds) {
        return null
      }

      return {
        project,
        tableNumber,
        bounds,
        searchLabel: buildProjectSearchLabel(tableNumber, project.name, project.participants),
        title: `${tableNumber}. ${project.name}`,
      }
    })
    .filter((layer): layer is NonNullable<typeof layer> => layer != null)
}
