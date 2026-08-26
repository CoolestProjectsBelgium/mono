import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'
import { clearCsrfToken } from '~/utils/csrf-token'

function mockCsrfThen(response: unknown) {
  mockFetch
    .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
    .mockResolvedValueOnce(response)
}

function mockLoginActivation(loginResponse: unknown, userinfoResponse: unknown = { id: 1 }) {
  mockFetch
    .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
    .mockResolvedValueOnce(loginResponse)
    .mockResolvedValueOnce(userinfoResponse)
}

describe('useAuth', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).clearSession()
    clearCsrfToken()
    mockFetch.mockReset()
  })

  it('requestMagicLink POSTs to /login/mailToken', async () => {
    mockCsrfThen(null)
    const { requestMagicLink } = await callComposable(() => useAuth(), pinia)
    await requestMagicLink('test@example.com')
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/login/mailToken', expect.objectContaining({
      method: 'POST',
      body: { email: 'test@example.com' },
    }))
  })

  it('requestMagicLink does not set session before activation', async () => {
    mockCsrfThen({
      expires: '2099-01-01T00:00:00.000Z',
      language: 'nl',
      api_key: '',
    })
    const { requestMagicLink } = await callComposable(() => useAuth(), pinia)
    await requestMagicLink('test@example.com')
    expect(useAuthStore(pinia).isLoggedIn).toBe(false)
  })

  it('activateWithToken POSTs { jwt } to /login and verifies /userinfo', async () => {
    mockLoginActivation({ expires: '2099-01-01T00:00:00.000Z', language: 'nl', api_key: 'x' })
    const { activateWithToken } = await callComposable(() => useAuth(), pinia)
    const ok = await activateWithToken('abc-token')
    expect(mockFetch).toHaveBeenNthCalledWith(2, '/login', expect.objectContaining({
      method: 'POST',
      body: { jwt: 'abc-token' },
    }))
    expect(mockFetch).toHaveBeenNthCalledWith(3, '/userinfo', expect.any(Object))
    expect(ok).toBe('ok')
    expect(useAuthStore(pinia).isLoggedIn).toBe(true)
  })

  it('activateWithToken clears session when cookie verification fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce({ expires: '2099-01-01T00:00:00.000Z', language: 'nl', api_key: 'x' })
      .mockRejectedValueOnce({ statusCode: 401, message: 'Unauthorized' })
    const { activateWithToken } = await callComposable(() => useAuth(), pinia)
    const ok = await activateWithToken('abc-token')
    expect(ok).toBe('invalid')
    expect(useAuthStore(pinia).isLoggedIn).toBe(false)
  })

  it('null activate does not set session', async () => {
    mockFetch
      .mockResolvedValueOnce({ csrfToken: 'csrf-token' })
      .mockResolvedValueOnce(null)
    const { activateWithToken } = await callComposable(() => useAuth(), pinia)
    const ok = await activateWithToken('bad-token')
    expect(ok).toBe('invalid')
    expect(useAuthStore(pinia).isLoggedIn).toBe(false)
  })

  it('logout clears Pinia', async () => {
    mockCsrfThen(null)
    const store = useAuthStore(pinia)
    store.setExpires('2099-01-01T00:00:00.000Z')
    const { logout } = await callComposable(() => useAuth(), pinia)
    await logout()
    expect(store.isLoggedIn).toBe(false)
  })
})
