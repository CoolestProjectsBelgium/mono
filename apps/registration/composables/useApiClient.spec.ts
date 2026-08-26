import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'
import { ApiError } from './useApiClient'

const { navigateToMock, localePathMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  localePathMock: vi.fn((path: string) => path),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useLocalePath', () => () => localePathMock)
mockNuxtImport('useRoute', () => () => ({ query: {} }))
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { apiBase: 'https://api.coolestprojects.localhost:8443' },
}))

describe('useApiClient', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
    useAuthStore(pinia).clearSession()
    mockFetch.mockReset()
    navigateToMock.mockReset()
  })

  it('clears session and redirects on 401 when logged in', async () => {
    useAuthStore(pinia).setExpires('2099-01-01T00:00:00.000Z')
    mockFetch.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })
    const { apiFetch } = await callComposable(() => useApiClient(), pinia)

    await expect(apiFetch('/userinfo')).rejects.toBeInstanceOf(ApiError)
    expect(navigateToMock).toHaveBeenCalledWith('/login')
    expect(useAuthStore(pinia).isLoggedIn).toBe(false)
  })

  it('does not redirect on aborted requests', async () => {
    mockFetch.mockRejectedValue({ name: 'AbortError' })
    const { apiFetch } = await callComposable(() => useApiClient(), pinia)

    await expect(apiFetch('/userinfo')).rejects.toBeInstanceOf(ApiError)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('attaches x-csrf-token on unsafe requests', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-abc' })
      .mockResolvedValueOnce({ ok: true })

    const { apiFetch } = await callComposable(() => useApiClient(), pinia)
    await apiFetch('/registration', { method: 'POST', body: { user: {} } })

    expect(mockFetch).toHaveBeenNthCalledWith(1, '/csrf-token', expect.objectContaining({
      baseURL: 'http://localhost:3001',
      credentials: 'include',
    }))
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/registration', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'x-csrf-token': 'csrf-abc' }),
    }))
  })
})
