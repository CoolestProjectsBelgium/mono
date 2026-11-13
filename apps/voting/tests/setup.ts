import { vi } from 'vitest'
import type { Mock } from 'vitest'

// Nuxt 4's test environment evaluates this file twice: once as a vitest
// setup file and again when a spec imports `mockFetch` from it. Keep one
// mock on globalThis so the app code and the specs share the same instance.
const shared = globalThis as unknown as { __mockFetch?: Mock }
export const mockFetch: Mock = (shared.__mockFetch ??= vi.fn())

vi.stubGlobal('$fetch', mockFetch)
