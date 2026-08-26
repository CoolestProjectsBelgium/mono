import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

const { navigateToMock, localePathMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  localePathMock: vi.fn((path: string) => path),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useLocalePath', () => () => localePathMock)

describe('authenticated middleware', () => {
  beforeEach(async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
    setActivePinia(createPinia())
    navigateToMock.mockReset()
    localePathMock.mockImplementation((path: string) => path)
  })

  it('blocks unauthenticated routes', async () => {
    const { default: middleware } = await import('./authenticated')
    await middleware()
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })

  it('allows authenticated routes restored from localStorage', async () => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
      clear: () => { store.clear() },
    })
    setActivePinia(createPinia())
    localStorage.setItem('cp-auth', JSON.stringify({
      expires: '2099-01-01T00:00:00.000Z',
    }))
    const { default: middleware } = await import('./authenticated')
    const result = await middleware()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
    expect(useAuthStore().isLoggedIn).toBe(true)
  })

  it('allows authenticated routes', async () => {
    useAuthStore().setExpires('2099-01-01T00:00:00.000Z')
    const { default: middleware } = await import('./authenticated')
    const result = await middleware()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
