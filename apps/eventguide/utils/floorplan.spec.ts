import { describe, expect, it } from 'vitest'
import { parseTableNumber, buildProjectSearchLabel, projectsForMap } from '~/utils/floorplan'

describe('floorplan utils', () => {
  it('parses table numbers', () => {
    expect(parseTableNumber('Tafel_26')).toBe(26)
    expect(parseTableNumber('Tafel 12')).toBe(12)
  })

  it('builds searchable labels', () => {
    expect(buildProjectSearchLabel(3, 'Robot', ['Alex'])).toBe('3. Robot: Alex')
  })

  it('filters projects that can be placed on the map', () => {
    const projects = [
      { tableNumber: 1 },
      { tableNumber: null },
    ]
    expect(projectsForMap(projects)).toEqual([{ tableNumber: 1 }])
  })
})
