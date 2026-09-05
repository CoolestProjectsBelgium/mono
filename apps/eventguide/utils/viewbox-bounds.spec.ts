import { describe, expect, it } from 'vitest'
import { mapHeightFromBounds, readViewBoxFromSvgText, viewBoxToLeafletBounds } from '~/utils/viewbox-bounds'

describe('viewbox-bounds', () => {
  it('parses a standard viewBox into leaflet bounds', () => {
    expect(viewBoxToLeafletBounds('0 0 1190.55 841.89')).toEqual([
      [0, 0],
      [841.89, 1190.55],
    ])
  })

  it('returns null for invalid viewBox values', () => {
    expect(viewBoxToLeafletBounds('0 0 foo bar')).toBeNull()
  })

  it('reads map height from bounds', () => {
    const bounds = viewBoxToLeafletBounds('0 0 1200 740')!
    expect(mapHeightFromBounds(bounds)).toBe(740)
  })

  it('reads viewBox from raw SVG text', () => {
    const svg = '<svg viewBox="0 0 1190.55 841.89" xmlns="http://www.w3.org/2000/svg"></svg>'
    expect(readViewBoxFromSvgText(svg)).toEqual([
      [0, 0],
      [841.89, 1190.55],
    ])
  })
})
