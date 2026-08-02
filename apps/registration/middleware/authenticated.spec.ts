import { describe, expect, it, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'

const { navigateToMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)

describe('authenticated middleware', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    navigateToMock.mockReset()
  })

  it('blocks unauthenticated routes', async () => {
    const { default: middleware } = await import('./authenticated')
    await middleware()
    expect(navigateToMock).toHaveBeenCalledWith('/login')
  })

  it('allows authenticated routes', async () => {
    useAuthStore().setExpires('2099-01-01T00:00:00.000Z')
    const { default: middleware } = await import('./authenticated')
    const result = await middleware()
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(result).toBeUndefined()
  })
})
