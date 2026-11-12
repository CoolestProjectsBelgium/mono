import { vi } from 'vitest'

export const mockFetch = vi.fn()

vi.stubGlobal('$fetch', mockFetch)

// The app's default locale is Dutch and the specs assert Dutch copy/paths.
// happy-dom reports an English browser, which would make @nuxtjs/i18n's
// browser-language detection switch the test app to English.
for (const [key, value] of [['language', 'nl-BE'], ['languages', ['nl-BE', 'nl']]] as const) {
  Object.defineProperty(globalThis.navigator, key, { configurable: true, get: () => value })
}
