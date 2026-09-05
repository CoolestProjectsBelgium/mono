import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  extractTableBounds,
  parseSvgTransformAttr,
  transformBBoxToTableBounds,
} from '~/composables/useFloorplanMap'

function createSvgDocument(svg: string): Document {
  return new DOMParser().parseFromString(svg, 'image/svg+xml')
}

const identity = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }

describe('transformBBoxToTableBounds', () => {
  it('flips y into leaflet CRS.Simple space', () => {
    const bounds = transformBBoxToTableBounds(
      { x: 10, y: 20, width: 30, height: 20 },
      identity,
      100,
    )

    expect(bounds.x0).toBe(10)
    expect(bounds.y0).toBe(80)
    expect(bounds.x2).toBe(40)
    expect(bounds.y2).toBe(60)
  })

  it('subtracts the viewBox origin so overlay bounds start at 0', () => {
    const bounds = transformBBoxToTableBounds(
      { x: 0, y: 0, width: 10, height: 10 },
      { a: 1, b: 0, c: 0, d: 1, e: 100, f: 50 },
      200,
      { minX: 100, minY: 50 },
    )

    expect(bounds.x0).toBe(0)
    expect(bounds.y0).toBe(200)
    expect(bounds.x2).toBe(10)
    expect(bounds.y2).toBe(190)
  })
})

describe('parseSvgTransformAttr', () => {
  it('parses translate then rotate without a viewport scale', () => {
    const matrix = parseSvgTransformAttr('translate(100, 50) rotate(180)')
    expect(matrix.a).toBeCloseTo(-1)
    expect(matrix.d).toBeCloseTo(-1)
    expect(matrix.e).toBeCloseTo(100)
    expect(matrix.f).toBeCloseTo(50)
  })
})

describe('extractTableBounds', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('extracts table bounds using the svg viewBox height', () => {
    const svg = `
      <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <g id="table_01">
          <rect x="10" y="20" width="30" height="20" />
        </g>
      </svg>
    `
    const document = createSvgDocument(svg)
    const bounds = extractTableBounds(document, 100)

    expect(bounds[1]).toBeDefined()
    expect(bounds[1]).toHaveProperty('x0')
    expect(bounds[1]).toHaveProperty('y0')
  })

  it('places tables from transform attributes in viewBox units', () => {
    const parsed = createSvgDocument(`
      <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" width="16in" height="11in">
        <g id="table_01" transform="translate(50, 10)">
          <rect x="0" y="0" width="20" height="10" />
          <text x="-800" y="10">1.</text>
        </g>
      </svg>
    `)

    vi.spyOn(SVGGraphicsElement.prototype, 'getBBox').mockImplementation(function (this: SVGGraphicsElement) {
      if (this.id === 'table_01' && this.querySelector('text[display="none"]')) {
        return { x: 0, y: 0, width: 20, height: 10 } as DOMRect
      }
      return { x: -800, y: 0, width: 820, height: 20 } as DOMRect
    })

    const bounds = extractTableBounds(parsed, 100)
    expect(bounds[1].x0).toBeCloseTo(50)
    expect(bounds[1].x2).toBeCloseTo(70)
    expect(bounds[1].y0).toBeCloseTo(90)
    expect(bounds[1].y2).toBeCloseTo(80)
  })
})
