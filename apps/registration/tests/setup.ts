import { vi } from 'vitest'

export const mockFetch = vi.fn()

vi.stubGlobal('$fetch', mockFetch)
