import { describe, expect, it, vi } from 'vitest'
import { parseTableNumber, buildProjectSearchLabel, projectsForMap, resolveFloorplanUrl } from '~/utils/floorplan'

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

  it('resolves floor plan URLs against the API base', () => {
    expect(resolveFloorplanUrl('eventguide/floorplans/cp2025_zaal.svg', 'https://api.example.com'))
      .toBe('https://api.example.com/eventguide/floorplans/cp2025_zaal.svg')
    expect(resolveFloorplanUrl('eventguide/floorplans/cp2025_zaal.svg', 'https://api.example.com', '123'))
      .toBe('https://api.example.com/eventguide/floorplans/cp2025_zaal.svg?v=123')
  })

  it('uses a same-origin relative path on the eventguide host', () => {
    vi.stubGlobal('window', {
      location: {
        hostname: 'eventguide.coolestprojects.localhost',
      },
    })

    expect(resolveFloorplanUrl('eventguide/floorplans/cp2025_zaal.svg', 'https://api.example.com'))
      .toBe('/eventguide/floorplans/cp2025_zaal.svg')
    expect(resolveFloorplanUrl('eventguide/floorplans/cp2025_zaal.svg', 'https://api.example.com', '456'))
      .toBe('/eventguide/floorplans/cp2025_zaal.svg?v=456')

    vi.unstubAllGlobals()
  })
})
