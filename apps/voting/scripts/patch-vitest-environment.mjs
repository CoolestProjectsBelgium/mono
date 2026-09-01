import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const target = resolve(root, 'node_modules/vitest-environment-nuxt/index.mjs')
const source = resolve(
  root,
  'apps/voting/node_modules/@nuxt/test-utils/dist/vitest-environment.mjs',
)

writeFileSync(
  target,
  `export { default } from '${source.replace(/\\/g, '/')}'\n`,
)
