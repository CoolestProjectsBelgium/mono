import { describe, expect, it } from 'vitest'
import {
  formatPostalCodeOption,
  isValidPostalMunicipalityPair,
  normalizeSearchText,
  resolvePostalCodeLabel,
  searchPostalCodes,
} from '~/utils/postal-codes/search-postal-codes'

describe('normalizeSearchText', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeSearchText('Liège')).toBe('liege')
    expect(normalizeSearchText('  Mechelen  ')).toBe('mechelen')
  })
})

describe('searchPostalCodes', () => {
  it('finds municipalities by code prefix', () => {
    const results = searchPostalCodes('2800', 'nl')
    expect(results.some(entry => entry.postalcode === 2800 && entry.municipality_nl === 'Mechelen')).toBe(true)
  })

  it('finds municipalities by name', () => {
    const results = searchPostalCodes('meche', 'nl')
    expect(results.some(entry => entry.postalcode === 2800)).toBe(true)
  })

  it('uses French labels in fr locale formatting', () => {
    const results = searchPostalCodes('2800', 'fr')
    const mechelen = results.find(entry => entry.postalcode === 2800 && entry.municipality_nl === 'Mechelen')
    expect(mechelen).toBeDefined()
    expect(formatPostalCodeOption(mechelen!, 'fr')).toContain('Malines')
  })

  it('returns multiple municipalities for the same postcode', () => {
    const results = searchPostalCodes('2800', 'nl')
    expect(results.filter(entry => entry.postalcode === 2800).length).toBeGreaterThan(1)
  })

  it('requires at least two characters for text search', () => {
    expect(searchPostalCodes('m', 'nl')).toEqual([])
    expect(searchPostalCodes('me', 'nl').length).toBeGreaterThan(0)
  })
})

describe('isValidPostalMunicipalityPair', () => {
  it('accepts valid postal and municipality pairs', () => {
    expect(isValidPostalMunicipalityPair(2800, 'Mechelen')).toBe(true)
    expect(isValidPostalMunicipalityPair(2800, 'Malines')).toBe(true)
  })

  it('rejects invalid pairs', () => {
    expect(isValidPostalMunicipalityPair(2800, 'Antwerpen')).toBe(false)
    expect(isValidPostalMunicipalityPair(0, 'Mechelen')).toBe(false)
    expect(isValidPostalMunicipalityPair(2800, '')).toBe(false)
  })
})

describe('resolvePostalCodeLabel', () => {
  it('resolves label from postal code when municipality is missing', () => {
    expect(resolvePostalCodeLabel(2800, '', 'nl')).toBe('2800')
    expect(resolvePostalCodeLabel(2800, 'Mechelen', 'nl')).toContain('Mechelen')
  })
})
