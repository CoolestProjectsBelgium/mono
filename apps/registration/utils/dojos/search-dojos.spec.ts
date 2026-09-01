import { describe, expect, it } from 'vitest'
import { dojoFixture } from '~/fixtures/dojos'
import { isKnownDojoName, searchDojos } from './search-dojos'

describe('searchDojos', () => {
  it('returns no results for an empty query', () => {
    expect(searchDojos(dojoFixture, '')).toEqual([])
  })

  it('finds dojos by substring', () => {
    const matches = searchDojos(dojoFixture, 'balen')
    expect(matches.some(entry => entry.name === 'Balen')).toBe(true)
  })

  it('finds Westerlo', () => {
    expect(searchDojos(dojoFixture, 'wester').some(entry => entry.name === 'Westerlo')).toBe(true)
  })

  it('does not match session-style titles', () => {
    expect(searchDojos(dojoFixture, 'Summer Launch Event')).toEqual([])
  })
})

describe('isKnownDojoName', () => {
  it('accepts snapshot names without the Dojo prefix', () => {
    expect(isKnownDojoName(dojoFixture, 'Balen')).toBe(true)
    expect(isKnownDojoName(dojoFixture, 'Dojo Balen')).toBe(true)
  })

  it('rejects unknown names', () => {
    expect(isKnownDojoName(dojoFixture, 'Not a Dojo')).toBe(false)
  })
})
