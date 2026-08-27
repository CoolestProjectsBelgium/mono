import { describe, expect, it } from 'vitest'
import { isKnownDojoName, searchDojos } from './search-dojos'

describe('searchDojos', () => {
  it('finds dojos by substring', () => {
    const matches = searchDojos('balen')
    expect(matches.some(entry => entry.name === 'Balen')).toBe(true)
  })

  it('finds Westerlo', () => {
    expect(searchDojos('wester').some(entry => entry.name === 'Westerlo')).toBe(true)
  })

  it('does not match session-style titles', () => {
    expect(searchDojos('Summer Launch Event')).toEqual([])
  })
})

describe('isKnownDojoName', () => {
  it('accepts snapshot names without the Dojo prefix', () => {
    expect(isKnownDojoName('Balen')).toBe(true)
    expect(isKnownDojoName('Dojo Balen')).toBe(true)
  })

  it('rejects unknown names', () => {
    expect(isKnownDojoName('Not a Dojo')).toBe(false)
  })
})
