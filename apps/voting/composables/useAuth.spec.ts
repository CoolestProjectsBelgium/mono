import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createPinia, setActivePinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'
import { clearCsrfToken } from '~/utils/csrf-token'
import { useAuthStore } from '~/stores/auth'

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRuntimeConfig', () => () => ({
  public: { apiBaseURL: 'https://api.coolestprojects.localhost:8443' },
}))

function mockLoginFlow(user: { id: number, email: string, eventId: number }) {
  mockFetch
    .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
    .mockResolvedValueOnce({ jwt: 'jwt-abc' })
    .mockResolvedValueOnce(user)
}

describe('useAuth', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).clearSession()
    clearCsrfToken()
    mockFetch.mockReset()
    navigateToMock.mockReset()
  })

  it('login POSTs /auth/login, stores jwt, and fetches /auth/user', async () => {
    mockLoginFlow({ id: 1, email: 'jury', eventId: 2 })
    const auth = await callComposable(() => useAuth(), pinia)

    await auth.login({ username: 'jury', password: 'jury' })

    expect(mockFetch).toHaveBeenNthCalledWith(2, '/auth/login', expect.objectContaining({
      method: 'POST',
      body: { username: 'jury', password: 'jury' },
    }))
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/auth/user', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer jwt-abc' }),
    }))
    expect(auth.token.value).toBe('Bearer jwt-abc')
    expect(auth.user.value).toEqual({ id: 1, email: 'jury', eventId: 2 })
    expect(navigateToMock).toHaveBeenCalledWith('/')
  })

  it('logout POSTs /auth/logout and clears session', async () => {
    mockLoginFlow({ id: 1, email: 'jury', eventId: 2 })
    const auth = await callComposable(() => useAuth(), pinia)
    await auth.login({ username: 'jury', password: 'jury' })
    mockFetch.mockReset()
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce(null)

    await auth.logout()

    expect(mockFetch).toHaveBeenCalledWith('/auth/logout', expect.objectContaining({
      method: 'POST',
    }))
    expect(auth.loggedIn.value).toBe(false)
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })
})
