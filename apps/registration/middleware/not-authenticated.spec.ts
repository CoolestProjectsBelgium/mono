import { describe, expect, it, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)

describe('not-authenticated middleware', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    navigateToMock.mockReset()
  })

  it('redirects logged-in users away from login', async () => {
    useAuthStore().setExpires('2099-01-01T00:00:00.000Z')
    const { default: middleware } = await import('./not-authenticated')
    await middleware({ query: {} } as never)
    expect(navigateToMock).toHaveBeenCalledWith('/user')
  })

  it('allows login page when a magic-link token is present', async () => {
    useAuthStore().setExpires('2099-01-01T00:00:00.000Z')
    const { default: middleware } = await import('./not-authenticated')
    const result = await middleware({ query: { token: 'jwt-token' } } as never)
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
