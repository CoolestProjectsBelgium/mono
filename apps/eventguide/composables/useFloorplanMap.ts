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

export interface AffineMatrix {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
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

export function parseViewBox(svg: SVGSVGElement): { minX: number, minY: number, width: number, height: number } | null {
  const attr = svg.getAttribute('viewBox')
  if (attr) {
    const parts = attr.trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every((value) => Number.isFinite(value)) && parts[2] > 0 && parts[3] > 0) {
      return { minX: parts[0], minY: parts[1], width: parts[2], height: parts[3] }
    }
  }

  const viewBox = svg.viewBox?.baseVal
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { minX: viewBox.x, minY: viewBox.y, width: viewBox.width, height: viewBox.height }
  }

  return null
}

/**
 * Make the overlay image use viewBox units as its intrinsic size.
 * Visio exports set width/height in inches, which would otherwise disagree with Leaflet bounds.
 */
export function applyViewBoxAsPixelSize(svg: SVGSVGElement): void {
  const viewBox = parseViewBox(svg)
  if (!viewBox) {
    return
  }
  svg.setAttribute('width', String(viewBox.width))
  svg.setAttribute('height', String(viewBox.height))
}

function identityMatrix(): AffineMatrix {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
}

function multiplyMatrices(left: AffineMatrix, right: AffineMatrix): AffineMatrix {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  }
}

function translateMatrix(x: number, y: number): AffineMatrix {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y }
}

function rotateMatrix(degrees: number): AffineMatrix {
  const radians = degrees * Math.PI / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 }
}

function scaleMatrix(x: number, y: number): AffineMatrix {
  return { a: x, b: 0, c: 0, d: y, e: 0, f: 0 }
}

/**
 * Parse an SVG transform attribute into user-space units.
 * Unlike getCTM, this does not include the viewBox-to-viewport scale from Visio inch sizes.
 */
export function parseSvgTransformAttr(attr: string): AffineMatrix {
  let matrix = identityMatrix()
  const token = /(matrix|translate|rotate|scale)\s*\(([^)]*)\)/gi
  let match: RegExpExecArray | null
  while ((match = token.exec(attr)) !== null) {
    const name = match[1].toLowerCase()
    const args = match[2].trim().split(/[\s,]+/).map(Number).filter((value) => Number.isFinite(value))
    if (name === 'translate') {
      matrix = multiplyMatrices(matrix, translateMatrix(args[0] ?? 0, args[1] ?? 0))
    }
    else if (name === 'rotate') {
      matrix = multiplyMatrices(matrix, rotateMatrix(args[0] ?? 0))
    }
    else if (name === 'scale') {
      matrix = multiplyMatrices(matrix, scaleMatrix(args[0] ?? 1, args[1] ?? args[0] ?? 1))
    }
    else if (name === 'matrix' && args.length === 6) {
      matrix = multiplyMatrices(matrix, {
        a: args[0],
        b: args[1],
        c: args[2],
        d: args[3],
        e: args[4],
        f: args[5],
      })
    }
  }
  return matrix
}

export function localTransform(element: SVGGraphicsElement): AffineMatrix {
  const attr = element.getAttribute('transform')
  if (attr) {
    return parseSvgTransformAttr(attr)
  }
  return identityMatrix()
}

export function accumulatedUserTransform(
  element: SVGGraphicsElement,
  root: SVGSVGElement,
): AffineMatrix {
  const chain: SVGGraphicsElement[] = []
  let current: Element | null = element
  while (current && current !== root) {
    chain.push(current as SVGGraphicsElement)
    current = current.parentElement
  }

  let matrix = identityMatrix()
  for (const node of chain.reverse()) {
    matrix = multiplyMatrices(matrix, localTransform(node))
  }
  return matrix
}

export function transformBBoxToTableBounds(
  bbox: { x: number, y: number, width: number, height: number },
  matrix: AffineMatrix,
  mapHeight: number,
  origin: { minX: number, minY: number } = { minX: 0, minY: 0 },
): TableBounds {
  const x = bbox.x + (bbox.width / 2)
  const y = bbox.y + (bbox.height / 2)
  const w2 = bbox.width / 2
  const h2 = bbox.height / 2

  const project = (px: number, py: number) => {
    const svgX = (matrix.a * px) + (matrix.c * py) + matrix.e
    const svgY = (matrix.b * px) + (matrix.d * py) + matrix.f
    return {
      x: svgX - origin.minX,
      y: mapHeight - (svgY - origin.minY),
    }
  }

  const p0 = project(x - w2, y - h2)
  const p1 = project(x - w2, y + h2)
  const p2 = project(x + w2, y + h2)
  const p3 = project(x + w2, y - h2)

  return {
    x0: p0.x,
    y0: p0.y,
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y,
    x3: p3.x,
    y3: p3.y,
  }
}

function tableGroupBBox(group: SVGGElement): DOMRect {
  const texts = Array.from(group.querySelectorAll('text'))
  const previous = texts.map((node) => node.getAttribute('display'))
  for (const node of texts) {
    node.setAttribute('display', 'none')
  }
  try {
    return group.getBBox()
  }
  finally {
    texts.forEach((node, index) => {
      const value = previous[index]
      if (value == null) {
        node.removeAttribute('display')
      }
      else {
        node.setAttribute('display', value)
      }
    })
  }
}

/**
 * getBBox requires the SVG to be attached to the document (legacy map used an <object> tag).
 */
export function mountSvgForMeasurement(svgDocument: Document): {
  svg: SVGSVGElement
  cleanup: () => void
} | null {
  const parsed = svgDocument.querySelector('svg')
  if (!parsed || !import.meta.client) {
    return null
  }

  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = 'position:absolute;left:-9999px;top:0;overflow:visible;opacity:0;pointer-events:none'
  const svg = parsed.cloneNode(true) as SVGSVGElement
  applyViewBoxAsPixelSize(svg)
  host.appendChild(svg)
  document.body.appendChild(host)

  return {
    svg,
    cleanup: () => host.remove(),
  }
}

export function extractTableBounds(
  svgDocument: Document,
  mapHeight: number,
): Record<number, TableBounds> {
  const mounted = mountSvgForMeasurement(svgDocument)
  const svg = mounted?.svg ?? svgDocument.querySelector('svg')
  if (!svg) {
    return {}
  }

  applyViewBoxAsPixelSize(svg)

  const viewBox = parseViewBox(svg)
  const origin = {
    minX: viewBox?.minX ?? 0,
    minY: viewBox?.minY ?? 0,
  }

  const coords: Record<number, TableBounds> = {}
  const groups = svg.getElementsByTagName('g')

  for (const part of groups) {
    if (!String(part.id).startsWith('table_')) {
      continue
    }

    const tableNumber = Number.parseInt(part.id.substring(6), 10)
    if (!Number.isFinite(tableNumber)) {
      continue
    }

    try {
      coords[tableNumber] = transformBBoxToTableBounds(
        tableGroupBBox(part),
        accumulatedUserTransform(part, svg),
        mapHeight,
        origin,
      )
    }
    catch {
      continue
    }
  }

  mounted?.cleanup()
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
