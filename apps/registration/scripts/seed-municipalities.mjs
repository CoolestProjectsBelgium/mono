/**
 * Regenerates apps/api/src/seeder/be-municipalities.json from the public
 * zipcode-belgium dataset.
 *
 * Source: https://github.com/jief/zipcode-belgium
 * French municipality names are applied via FR_NAME_BY_NL for common bilingual cities;
 * all other localities keep the same label in nl/fr/de (as in the upstream data,
 * which has no German names at all).
 * The API seeder loads this file into the Municipality table (event-scoped,
 * one row per postal code) — see apps/api/src/registration/registration.service.ts's
 * validate() for how it's used (postal code must match a known municipality),
 * mirroring how be-dojos.json/seed-dojos.mjs feeds the Affiliation table.
 *
 * Usage: npm run seed:municipalities -w @coolestprojects/registration
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

/**
 * Belgium's three regions, by postal-code range (contiguous, no gaps across
 * 1000-9999): Brussels-Capital is 1000-1299; Flanders and Wallonia each hold
 * two disjoint bands around it.
 */
function regionForPostalCode(postalcode) {
  if (postalcode >= 1000 && postalcode <= 1299) return 'Brussels'
  if (postalcode >= 1300 && postalcode <= 1499) return 'Wallonia'
  if (postalcode >= 1500 && postalcode <= 3999) return 'Flanders'
  if (postalcode >= 4000 && postalcode <= 7999) return 'Wallonia'
  if (postalcode >= 8000 && postalcode <= 9999) return 'Flanders'
  throw new Error(`Postal code ${postalcode} is outside the known Belgian region ranges`)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const outputPath = join(root, 'apps', 'api', 'src', 'seeder', 'be-municipalities.json')

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
  const municipality_name_nl = String(row.city ?? '').trim()
  if (!Number.isInteger(postalcode) || postalcode < 1000 || postalcode > 9999) {
    throw new Error(`Invalid postal code in source: ${JSON.stringify(row)}`)
  }
  if (!municipality_name_nl) {
    throw new Error(`Missing city name for postal code ${postalcode}`)
  }

  const municipality_name_fr = FR_NAME_BY_NL[municipality_name_nl] ?? municipality_name_nl
  return {
    postalcode,
    municipality_name_nl,
    municipality_name_fr,
    // Upstream has no German names at all — fall back to the Dutch label,
    // the same "no translation, reuse the primary source label" rule
    // already applied to French above.
    municipality_name_de: municipality_name_nl,
    region: regionForPostalCode(postalcode),
  }
})

await writeFile(outputPath, `${JSON.stringify(entries)}\n`, 'utf8')
console.log(`Wrote ${entries.length} municipalities to ${outputPath}`)
