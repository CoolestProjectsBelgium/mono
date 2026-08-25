import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'
import { ApiError } from './useApiClient'

const { navigateToMock, routeQuery } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  routeQuery: { value: {} as Record<string, string> },
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRoute', () => () => ({ query: routeQuery.value }))
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { apiBase: 'https://api.coolestprojects.localhost:8443' },
}))

describe('useApiClient', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).clearSession()
    routeQuery.value = {}
    mockFetch.mockReset()
    navigateToMock.mockReset()
  })

  it('redirects to /login on 401 for protected endpoints', async () => {
    mockFetch.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })
    const { apiFetch } = await callComposable(() => useApiClient(), pinia)

    await expect(apiFetch('/userinfo')).rejects.toBeInstanceOf(ApiError)
    expect(navigateToMock).toHaveBeenCalledWith('/login')
    expect(useAuthStore(pinia).isLoggedIn).toBe(false)
  })

  it('does not redirect on 401 for POST /login', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-abc' })
      .mockRejectedValueOnce({ statusCode: 401, message: 'Unauthorized' })
    const { apiFetch } = await callComposable(() => useApiClient(), pinia)

    await expect(apiFetch('/login', { method: 'POST', body: { jwt: 'bad' } })).rejects.toBeInstanceOf(ApiError)
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it('does not redirect on 401 while a magic-link token is in the route', async () => {
    routeQuery.value = { token: 'jwt-from-email' }
    mockFetch.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })
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
      baseURL: 'https://api.coolestprojects.localhost:8443',
      credentials: 'include',
    }))
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/registration', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'x-csrf-token': 'csrf-abc' }),
    }))
  })
})
