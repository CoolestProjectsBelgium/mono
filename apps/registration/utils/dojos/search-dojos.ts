import type { DojoEntry } from '~/utils/dojos/types'
import { stripDojoPrefix } from '~/utils/dojos/parse-dojo-html'
import { normalizeSearchText } from '~/utils/postal-codes/search-postal-codes'

export function isKnownDojoName(dojos: DojoEntry[], name: string): boolean {
  const needle = stripDojoPrefix(name)
  return needle.length > 0 && dojos.some(entry => entry.name === needle)
}

export function searchDojos(dojos: DojoEntry[], query: string, limit = 10): DojoEntry[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return dojos.slice(0, limit)
  }

  const matches: DojoEntry[] = []
  for (const entry of dojos) {
    if (normalizeSearchText(entry.name).includes(normalizedQuery)) {
      matches.push(entry)
      if (matches.length >= limit) {
        break
      }
    }
  }
  return matches
}
