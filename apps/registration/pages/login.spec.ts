import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import LoginPage from './login.vue'

const {
  activateWithTokenMock,
  replaceMock,
} = vi.hoisted(() => ({
  activateWithTokenMock: vi.fn(),
  replaceMock: vi.fn(),
}))

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    requestMagicLink: vi.fn(),
    activateWithToken: activateWithTokenMock,
    logout: vi.fn(),
    isLoggedIn: computed(() => false),
  }),
}))

vi.mock('~/components/ApiUnavailableBanner.vue', () => ({
  default: {
    props: ['messageKey'],
    template: '<p data-testid="expired-banner">{{ messageKey }}</p>',
  },
}))

vi.mock('~/components/CtaButton.vue', () => ({
  default: {
    template: '<button type="submit"><slot /></button>',
  },
}))

mockNuxtImport('useRoute', () => () => ({ query: { token: 'abc-token' } }))
mockNuxtImport('useRouter', () => () => ({ replace: replaceMock }))
mockNuxtImport('useLocalePath', () => () => (path: string) => path)
mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
}))

describe('login page token activation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    activateWithTokenMock.mockReset()
    replaceMock.mockReset()
  })

  it('activates token from query on mount and navigates to /user', async () => {
    activateWithTokenMock.mockResolvedValue(true)
    await mountSuspended(LoginPage)
    await vi.waitFor(() => {
      expect(activateWithTokenMock).toHaveBeenCalledWith('abc-token')
      expect(replaceMock).toHaveBeenCalledWith('/user')
    })
  })

  it('shows link expired banner when activation fails', async () => {
    activateWithTokenMock.mockResolvedValue(false)
    const wrapper = await mountSuspended(LoginPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="expired-banner"]').text()).toBe('login.linkExpired')
    })
    expect(replaceMock).not.toHaveBeenCalledWith('/user')
  })
})
