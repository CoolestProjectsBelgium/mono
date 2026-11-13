import { vi } from 'vitest'
import type { Mock } from 'vitest'

// Nuxt 4's test environment evaluates this file twice: once as a vitest
// setup file and again when a spec imports `mockFetch` from it. Keep one
// mock on globalThis so the app code and the specs share the same instance.
const shared = globalThis as unknown as { __mockFetch?: Mock }
export const mockFetch: Mock = (shared.__mockFetch ??= vi.fn())

vi.stubGlobal('$fetch', mockFetch)

// The app's default locale is Dutch and the specs assert Dutch copy/paths.
// happy-dom reports an English browser, which would make @nuxtjs/i18n's
// browser-language detection switch the test app to English.
for (const [key, value] of [['language', 'nl-BE'], ['languages', ['nl-BE', 'nl']]] as const) {
  Object.defineProperty(globalThis.navigator, key, { configurable: true, get: () => value })
}
