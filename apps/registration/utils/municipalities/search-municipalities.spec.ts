import { describe, expect, it } from 'vitest'
import { municipalityFixture } from '~/fixtures/municipalities'
import {
  formatMunicipalityOption,
  isKnownMunicipality,
  normalizeSearchText,
  resolveMunicipalityLabel,
  searchMunicipalities,
} from '~/utils/municipalities/search-municipalities'

describe('normalizeSearchText', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeSearchText('Liège')).toBe('liege')
    expect(normalizeSearchText('  Mechelen  ')).toBe('mechelen')
  })
})

describe('searchMunicipalities', () => {
  it('finds municipalities by code prefix', () => {
    const results = searchMunicipalities(municipalityFixture, '2800', 'nl')
    expect(results.some(entry => entry.postalcode === 2800 && entry.municipality_name_nl === 'Mechelen')).toBe(true)
  })

  it('finds municipalities by name', () => {
    const results = searchMunicipalities(municipalityFixture, 'meche', 'nl')
    expect(results.some(entry => entry.postalcode === 2800)).toBe(true)
  })

  it('uses French labels in fr locale formatting', () => {
    const results = searchMunicipalities(municipalityFixture, '2800', 'fr')
    const mechelen = results.find(entry => entry.postalcode === 2800 && entry.municipality_name_nl === 'Mechelen')
    expect(mechelen).toBeDefined()
    expect(formatMunicipalityOption(mechelen!, 'fr')).toContain('Malines')
  })

  it('returns multiple municipalities for the same postcode', () => {
    const results = searchMunicipalities(municipalityFixture, '2800', 'nl')
    expect(results.filter(entry => entry.postalcode === 2800).length).toBeGreaterThan(1)
  })

  it('requires at least two characters for text search', () => {
    expect(searchMunicipalities(municipalityFixture, 'm', 'nl')).toEqual([])
    expect(searchMunicipalities(municipalityFixture, 'me', 'nl').length).toBeGreaterThan(0)
  })
})

describe('isKnownMunicipality', () => {
  it('accepts valid postal and municipality pairs', () => {
    expect(isKnownMunicipality(municipalityFixture, 2800, 'Mechelen')).toBe(true)
    expect(isKnownMunicipality(municipalityFixture, 2800, 'Malines')).toBe(true)
  })

  it('rejects invalid pairs', () => {
    expect(isKnownMunicipality(municipalityFixture, 2800, 'Antwerpen')).toBe(false)
    expect(isKnownMunicipality(municipalityFixture, 0, 'Mechelen')).toBe(false)
    expect(isKnownMunicipality(municipalityFixture, 2800, '')).toBe(false)
  })
})

describe('resolveMunicipalityLabel', () => {
  it('resolves label from postal code when municipality is missing', () => {
    expect(resolveMunicipalityLabel(municipalityFixture, 2800, '', 'nl')).toBe('2800')
    expect(resolveMunicipalityLabel(municipalityFixture, 2800, 'Mechelen', 'nl')).toContain('Mechelen')
  })
})
