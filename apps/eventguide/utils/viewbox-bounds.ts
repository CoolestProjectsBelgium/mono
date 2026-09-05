export type LeafletBounds = [[number, number], [number, number]]

/**
 * Parse an SVG viewBox attribute into Leaflet CRS.Simple image bounds.
 * Legacy maps use [[0, 0], [height, width]] (y then x).
 */
export function viewBoxToLeafletBounds(viewBox: string): LeafletBounds | null {
  const parts = viewBox.trim().split(/[\s,]+/).map(Number)
  if (parts.length !== 4 || parts.some((value) => !Number.isFinite(value))) {
    return null
  }

  const [, , width, height] = parts
  return [
    [0, 0],
    [height, width],
  ]
}

export function readViewBoxFromSvgText(svgText: string): LeafletBounds | null {
  const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/i)
  if (viewBoxMatch) {
    return viewBoxToLeafletBounds(viewBoxMatch[1])
  }

  const widthMatch = svgText.match(/\bwidth=["']([0-9.]+)/i)
  const heightMatch = svgText.match(/\bheight=["']([0-9.]+)/i)
  if (widthMatch && heightMatch) {
    const width = Number.parseFloat(widthMatch[1])
    const height = Number.parseFloat(heightMatch[1])
    if (Number.isFinite(width) && Number.isFinite(height)) {
      return [
        [0, 0],
        [height, width],
      ]
    }
  }

  return null
}

export function readViewBoxBounds(svg: SVGSVGElement): LeafletBounds | null {
  const viewBox = svg.getAttribute('viewBox')
  if (viewBox) {
    return viewBoxToLeafletBounds(viewBox)
  }

  const width = Number.parseFloat(svg.getAttribute('width') ?? '')
  const height = Number.parseFloat(svg.getAttribute('height') ?? '')
  if (Number.isFinite(width) && Number.isFinite(height)) {
    return [
      [0, 0],
      [height, width],
    ]
  }

  return null
}

export function mapHeightFromBounds(bounds: LeafletBounds): number {
  return bounds[1][0]
}
