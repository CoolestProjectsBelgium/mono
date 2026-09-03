import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'
import { ApiError } from './useApiClient'
import { useAuthStore } from '~/stores/auth'

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { apiBaseURL: 'https://api.coolestprojects.localhost:8443' },
}))

describe('useApiClient', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).clearSession()
    mockFetch.mockReset()
    navigateToMock.mockReset()
  })

  it('attaches x-csrf-token and credentials on unsafe requests', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-abc' })
      .mockResolvedValueOnce({ ok: true })

    const { apiFetch } = await callComposable(() => useApiClient(), pinia)
    await apiFetch('/auth/login', { method: 'POST', body: { username: 'jury', password: 'jury' } })

    expect(mockFetch).toHaveBeenNthCalledWith(1, '/csrf-token', expect.objectContaining({
      baseURL: 'http://localhost:3001',
      credentials: 'include',
    }))
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/auth/login', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: expect.objectContaining({ 'x-csrf-token': 'csrf-abc' }),
    }))
  })

  it('sends Authorization bearer when jwt is stored', async () => {
    useAuthStore().setJwt('stored-jwt')
    mockFetch.mockResolvedValue({ id: 1, email: 'jury', eventId: 2 })

    const { apiFetch } = await callComposable(() => useApiClient(), pinia)
    await apiFetch('/auth/user')

    expect(mockFetch).toHaveBeenCalledWith('/auth/user', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer stored-jwt' }),
    }))
  })

  it('uses getApiErrorMessage for failed requests', async () => {
    useAuthStore().setJwt('expired')
    mockFetch.mockRejectedValue({ statusCode: 403, data: { message: 'invalid csrf token' } })

    const { apiFetch } = await callComposable(() => useApiClient(), pinia)

    await expect(apiFetch('/auth/user')).rejects.toMatchObject({
      message: 'invalid csrf token',
    })
  })

  it('clears session and redirects on 401 when authenticated', async () => {
    useAuthStore().setJwt('expired')
    mockFetch.mockRejectedValue({ statusCode: 401, message: 'Unauthorized' })

    const { apiFetch } = await callComposable(() => useApiClient(), pinia)

    await expect(apiFetch('/auth/user')).rejects.toBeInstanceOf(ApiError)
    expect(useAuthStore().loggedIn).toBe(false)
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })
})
