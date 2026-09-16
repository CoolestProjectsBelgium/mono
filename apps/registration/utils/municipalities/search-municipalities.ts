import postalCodesData from '~/data/be-postal-codes.json'
import type { PostalCodeEntry, PostalCodeLocale } from '~/utils/postal-codes/types'

const postalCodes = postalCodesData as PostalCodeEntry[]

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

export function getMunicipalityLabel(
  entry: PostalCodeEntry,
  locale: PostalCodeLocale,
): string {
  if (locale === 'fr') {
    return entry.municipality_fr
  }
  return entry.municipality_nl
}

export function formatPostalCodeOption(
  entry: PostalCodeEntry,
  locale: PostalCodeLocale,
): string {
  return `${entry.postalcode} ${getMunicipalityLabel(entry, locale)}`
}

export function searchPostalCodes(
  query: string,
  locale: PostalCodeLocale = 'nl',
  limit = 10,
): PostalCodeEntry[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return []
  }

  const isNumericQuery = /^\d+$/.test(normalizedQuery)
  const minLength = isNumericQuery ? 1 : 2
  if (normalizedQuery.length < minLength) {
    return []
  }

  const matches: PostalCodeEntry[] = []
  for (const entry of postalCodes) {
    const code = String(entry.postalcode)
    const nl = normalizeSearchText(entry.municipality_nl)
    const fr = normalizeSearchText(entry.municipality_fr)
    const label = normalizeSearchText(getMunicipalityLabel(entry, locale))

    const codeMatch = code.startsWith(normalizedQuery)
    const nameMatch = nl.includes(normalizedQuery)
      || fr.includes(normalizedQuery)
      || label.includes(normalizedQuery)

    if (codeMatch || nameMatch) {
      matches.push(entry)
      if (matches.length >= limit) {
        break
      }
    }
  }

  return matches
}

export function isValidPostalMunicipalityPair(
  postalcode: number,
  municipalityName: string,
): boolean {
  if (!postalcode || postalcode < 1000 || postalcode > 9999 || !municipalityName.trim()) {
    return false
  }

  const normalizedName = normalizeSearchText(municipalityName)
  return postalCodes.some((entry) => {
    if (entry.postalcode !== postalcode) {
      return false
    }
    return normalizeSearchText(entry.municipality_nl) === normalizedName
      || normalizeSearchText(entry.municipality_fr) === normalizedName
  })
}

export function findPostalCodeEntry(
  postalcode: number,
  municipalityName: string,
): PostalCodeEntry | undefined {
  const normalizedName = normalizeSearchText(municipalityName)
  return postalCodes.find((entry) => {
    if (entry.postalcode !== postalcode) {
      return false
    }
    return normalizeSearchText(entry.municipality_nl) === normalizedName
      || normalizeSearchText(entry.municipality_fr) === normalizedName
  })
}

export function findPostalCodeEntriesByCode(postalcode: number): PostalCodeEntry[] {
  if (!postalcode || postalcode < 1000 || postalcode > 9999) {
    return []
  }
  return postalCodes.filter(entry => entry.postalcode === postalcode)
}

export function resolvePostalCodeLabel(
  postalcode: number,
  municipalityName: string,
  locale: PostalCodeLocale,
): string {
  if (postalcode <= 0) {
    return ''
  }
  if (municipalityName) {
    const entry = findPostalCodeEntry(postalcode, municipalityName)
    return entry
      ? formatPostalCodeOption(entry, locale)
      : `${postalcode} ${municipalityName}`
  }
  const matches = findPostalCodeEntriesByCode(postalcode)
  if (matches.length === 1) {
    return formatPostalCodeOption(matches[0], locale)
  }
  return String(postalcode)
}

export function getAllPostalCodes(): PostalCodeEntry[] {
  return postalCodes
}
