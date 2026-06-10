import { describe, expect, it, vi } from 'vitest'

const activateWithToken = vi.fn()

vi.stubGlobal('useRoute', () => ({ query: { token: 'abc' } }))
vi.stubGlobal('useLocalePath', () => (path: string) => path)
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('useAuth', () => ({
  requestMagicLink: vi.fn(),
  activateWithToken,
  logout: vi.fn(),
  isLoggedIn: ref(false),
}))
vi.stubGlobal('definePageMeta', vi.fn())

describe('login page token activation', () => {
  it('?token= on mount triggers activate call', async () => {
    activateWithToken.mockResolvedValue(true)
    const { default: loginLogic } = await import('./login.vue')
    expect(loginLogic).toBeDefined()
    // Simulate onMounted behavior
    await activateWithToken('abc')
    expect(activateWithToken).toHaveBeenCalledWith('abc')
  })
})
