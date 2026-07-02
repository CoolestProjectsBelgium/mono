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
  public: { apiBase: '/_api' },
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
    mockFetch.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })
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
})
