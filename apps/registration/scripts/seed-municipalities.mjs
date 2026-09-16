/**
 * Regenerates data/be-postal-codes.json from the public zipcode-belgium dataset.
 *
 * Source: https://github.com/jief/zipcode-belgium
 * French municipality names are applied via FR_NAME_BY_NL for common bilingual cities;
 * all other localities keep the same label in both languages (as in the upstream data).
 *
 * Usage: npm run seed:postal-codes -w @coolestprojects/registration
 */
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL =
  'https://raw.githubusercontent.com/jief/zipcode-belgium/master/zipcode-belgium.json'

/** Dutch city label → French label (upstream is monolingual). */
const FR_NAME_BY_NL = {
  Antwerpen: 'Anvers',
  Mechelen: 'Malines',
  Leuven: 'Louvain',
  Brugge: 'Bruges',
  Gent: 'Gand',
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = join(root, 'data', 'be-postal-codes.json')

const response = await fetch(SOURCE_URL)
if (!response.ok) {
  throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText}`)
}

const source = await response.json()
if (!Array.isArray(source) || source.length === 0) {
  throw new Error('Unexpected source payload: expected a non-empty array')
}

const entries = source.map((row) => {
  const postalcode = Number(row.zip)
  const municipality_nl = String(row.city ?? '').trim()
  if (!Number.isInteger(postalcode) || postalcode < 1000 || postalcode > 9999) {
    throw new Error(`Invalid postal code in source: ${JSON.stringify(row)}`)
  }
  if (!municipality_nl) {
    throw new Error(`Missing city name for postal code ${postalcode}`)
  }

  return {
    postalcode,
    municipality_nl,
    municipality_fr: FR_NAME_BY_NL[municipality_nl] ?? municipality_nl,
  }
})

await writeFile(outputPath, `${JSON.stringify(entries)}\n`, 'utf8')
console.log(`Wrote ${entries.length} postal codes to ${outputPath}`)
