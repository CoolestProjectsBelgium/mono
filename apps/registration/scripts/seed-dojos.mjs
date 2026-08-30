/**
 * Regenerates apps/api/src/seeder/be-dojos.json from CoderDojo Belgium map marker titles.
 *
 * Source: https://coderdojobelgium.be/nl/dojos
 * Parses unique <h3> club names from the embedded map, not the session table.
 * The API seeder loads this file into the Affiliations table.
 *
 * Usage: npm run seed:dojos -w @coolestprojects/registration
 */
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL = 'https://coderdojobelgium.be/nl/dojos'
const H3_PATTERN = /<h3>(.*?)<\\?\/h3>/gi

function decodeHtmlEntities(value) {
  return value
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDojoNamesFromHtml(html) {
  const names = new Set()
  for (const match of html.matchAll(H3_PATTERN)) {
    const name = decodeHtmlEntities(match[1] ?? '').replace(/^dojo\s+/i, '').trim()
    if (name) {
      names.add(name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'nl'))
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = join(root, '..', 'api', 'src', 'seeder', 'be-dojos.json')

const response = await fetch(SOURCE_URL)
if (!response.ok) {
  throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText}`)
}

const html = await response.text()
const names = parseDojoNamesFromHtml(html)
if (names.length < 20) {
  throw new Error(`Unexpected dojo payload: expected many map names, got ${names.length}`)
}

const entries = names.map((name) => ({ name }))
await writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`Wrote ${entries.length} dojos to ${outputPath}`)
