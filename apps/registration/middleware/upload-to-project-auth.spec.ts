import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { AUTH_STORAGE_KEY } from '~/utils/auth-storage'

const { navigateToMock, localePathMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  localePathMock: vi.fn((path: string) => path),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useLocalePath', () => () => localePathMock)

function createLocalStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
  }
}

describe('upload to project navigation auth', () => {
  beforeEach(() => {
    vi.stubGlobal('import.meta', { ...import.meta, server: false, client: true })
    vi.stubGlobal('localStorage', createLocalStorageMock())
    setActivePinia(createPinia())
    navigateToMock.mockReset()
    localePathMock.mockImplementation((path: string) => path)
  })

  it('does not send the user to login when pinia is stale but localStorage is valid', async () => {
    useAuthStore().setExpires('2020-01-01T00:00:00.000Z')
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
      language: 'nl',
    }))

    const { default: middleware } = await import('~/middleware/authenticated')
    const result = await middleware()

    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
    expect(useAuthStore().isLoggedIn).toBe(true)
  })

  it('allows navigation after a simulated 401 without clearing storage', async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
    }))
  useAuthStore().setExpires('2099-01-01T00:00:00.000Z')

    const { default: middleware } = await import('~/middleware/authenticated')
    const result = await middleware()

    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
    expect(useAuthStore().isLoggedIn).toBe(true)
  })
})
