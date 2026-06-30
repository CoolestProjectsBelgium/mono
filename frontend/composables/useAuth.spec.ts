import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

describe('useAuth', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore(pinia).clearSession()
    mockFetch.mockReset()
  })

  it('requestMagicLink POSTs to /login/mailToken', async () => {
    mockFetch.mockResolvedValue(null)
    const { requestMagicLink } = await callComposable(() => useAuth(), pinia)
    await requestMagicLink('test@example.com')
    expect(mockFetch).toHaveBeenCalledWith('/login/mailToken', expect.objectContaining({
      method: 'POST',
      body: { email: 'test@example.com' },
    }))
  })

  it('activateWithToken POSTs { jwt } to /login', async () => {
    mockFetch.mockResolvedValue({ expires: '2099-01-01T00:00:00.000Z', language: 'nl', api_key: 'x' })
    const { activateWithToken } = await callComposable(() => useAuth(), pinia)
    const ok = await activateWithToken('abc-token')
    expect(mockFetch).toHaveBeenCalledWith('/login', expect.objectContaining({
      method: 'POST',
      body: { jwt: 'abc-token' },
    }))
    expect(ok).toBe(true)
    expect(useAuthStore(pinia).isLoggedIn).toBe(true)
  })

  it('null activate does not set session', async () => {
    mockFetch.mockResolvedValue(null)
    const { activateWithToken } = await callComposable(() => useAuth(), pinia)
    const ok = await activateWithToken('bad-token')
    expect(ok).toBe(false)
    expect(useAuthStore(pinia).isLoggedIn).toBe(false)
  })

  it('logout clears Pinia', async () => {
    mockFetch.mockResolvedValue(null)
    const store = useAuthStore(pinia)
    store.setExpires('2099-01-01T00:00:00.000Z')
    const { logout } = await callComposable(() => useAuth(), pinia)
    await logout()
    expect(store.isLoggedIn).toBe(false)
  })
})
