import { describe, expect, it } from 'vitest'
import { buildProjectsQuery, isFinishedResponse } from './projects-query'

describe('projects-query', () => {
  it('builds languages query param', () => {
    expect(buildProjectsQuery(['nl', 'en'])).toEqual({
      languages: '["nl","en"]',
    })
  })

  it('includes skipProject when provided', () => {
    expect(buildProjectsQuery(['nl'], 42)).toEqual({
      languages: '["nl"]',
      skipProject: '42',
    })
  })

  it('detects finished response', () => {
    expect(isFinishedResponse({ message: 'finished' })).toBe(true)
    expect(isFinishedResponse({
      project_id: 1,
      title: 'x',
      description: 'y',
      language: 'nl',
      categories: [],
      location: 'A1',
    })).toBe(false)
  })
})
