import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// vitest-environment-nuxt's published index.mjs re-exports @nuxt/test-utils's
// vitest environment via a relative path that assumes a nested install layout;
// under npm workspaces hoisting, @nuxt/test-utils usually lives elsewhere, so
// that relative import fails to resolve. Rewrite the shim to import from
// wherever @nuxt/test-utils actually resolves from this workspace, instead of
// hardcoding an assumed path.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const target = resolve(root, 'node_modules/vitest-environment-nuxt/index.mjs')

if (existsSync(dirname(target))) {
  const source = fileURLToPath(
    import.meta.resolve('@nuxt/test-utils/vitest-environment'),
  )

  writeFileSync(
    target,
    `export { default } from '${source.replace(/\\/g, '/')}'\n`,
  )
}
