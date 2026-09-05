import { describe, expect, it } from 'vitest'
import { extractTableBounds } from '~/composables/useFloorplanMap'

function createSvgDocument(svg: string): Document {
  return new DOMParser().parseFromString(svg, 'image/svg+xml')
}

describe('extractTableBounds', () => {
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
})
