import type { MunicipalityEntry, MunicipalityLocale } from '~/utils/municipalities/types'

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

export function getMunicipalityLabel(
  entry: MunicipalityEntry,
  locale: MunicipalityLocale,
): string {
  if (locale === 'fr') {
    return entry.municipality_name_fr
  }
  return entry.municipality_name_nl
}

export function formatMunicipalityOption(
  entry: MunicipalityEntry,
  locale: MunicipalityLocale,
): string {
  return `${entry.postalcode} ${getMunicipalityLabel(entry, locale)}`
}

export function searchMunicipalities(
  entries: MunicipalityEntry[],
  query: string,
  locale: MunicipalityLocale = 'nl',
  limit = 10,
): MunicipalityEntry[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return []
  }

  const isNumericQuery = /^\d+$/.test(normalizedQuery)
  const minLength = isNumericQuery ? 1 : 2
  if (normalizedQuery.length < minLength) {
    return []
  }

  const matches: MunicipalityEntry[] = []
  for (const entry of entries) {
    const code = String(entry.postalcode)
    const nl = normalizeSearchText(entry.municipality_name_nl)
    const fr = normalizeSearchText(entry.municipality_name_fr)
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

export function isKnownMunicipality(
  entries: MunicipalityEntry[],
  postalcode: number,
  municipalityName: string,
): boolean {
  if (!postalcode || postalcode < 1000 || postalcode > 9999 || !municipalityName.trim()) {
    return false
  }

  const normalizedName = normalizeSearchText(municipalityName)
  return entries.some((entry) => {
    if (entry.postalcode !== postalcode) {
      return false
    }
    return normalizeSearchText(entry.municipality_name_nl) === normalizedName
      || normalizeSearchText(entry.municipality_name_fr) === normalizedName
  })
}

export function findMunicipality(
  entries: MunicipalityEntry[],
  postalcode: number,
  municipalityName: string,
): MunicipalityEntry | undefined {
  const normalizedName = normalizeSearchText(municipalityName)
  return entries.find((entry) => {
    if (entry.postalcode !== postalcode) {
      return false
    }
    return normalizeSearchText(entry.municipality_name_nl) === normalizedName
      || normalizeSearchText(entry.municipality_name_fr) === normalizedName
  })
}

export function findMunicipalitiesByPostalcode(
  entries: MunicipalityEntry[],
  postalcode: number,
): MunicipalityEntry[] {
  if (!postalcode || postalcode < 1000 || postalcode > 9999) {
    return []
  }
  return entries.filter(entry => entry.postalcode === postalcode)
}

export function resolveMunicipalityLabel(
  entries: MunicipalityEntry[],
  postalcode: number,
  municipalityName: string,
  locale: MunicipalityLocale,
): string {
  if (postalcode <= 0) {
    return ''
  }
  if (municipalityName) {
    const entry = findMunicipality(entries, postalcode, municipalityName)
    return entry
      ? formatMunicipalityOption(entry, locale)
      : `${postalcode} ${municipalityName}`
  }
  const matches = findMunicipalitiesByPostalcode(entries, postalcode)
  if (matches.length === 1) {
    return formatMunicipalityOption(matches[0], locale)
  }
  return String(postalcode)
}
