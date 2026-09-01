import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import LoginPage from './login.vue'

const {
  activateWithTokenMock,
  replaceMock,
  requestMagicLinkMock,
  routeQuery,
} = vi.hoisted(() => ({
  activateWithTokenMock: vi.fn(),
  replaceMock: vi.fn(),
  requestMagicLinkMock: vi.fn(),
  routeQuery: { value: {} as Record<string, string> },
}))

vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    requestMagicLink: requestMagicLinkMock,
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

mockNuxtImport('useRoute', () => () => ({ query: routeQuery.value }))
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
    requestMagicLinkMock.mockReset()
    routeQuery.value = {}
  })

  it('activates token from query on mount and navigates to /project', async () => {
    routeQuery.value = { token: 'abc-token' }
    activateWithTokenMock.mockResolvedValue('ok')
    await mountSuspended(LoginPage)
    await vi.waitFor(() => {
      expect(activateWithTokenMock).toHaveBeenCalledWith('abc-token')
      expect(replaceMock).toHaveBeenCalledWith('/project')
    })
  })

  it('shows link expired banner and login form when activation fails', async () => {
    routeQuery.value = { token: 'abc-token' }
    activateWithTokenMock.mockResolvedValue('invalid')
    const wrapper = await mountSuspended(LoginPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="expired-banner"]').text()).toBe('login.linkExpired')
      expect(wrapper.find('form').exists()).toBe(true)
      expect(replaceMock).toHaveBeenCalledWith('/login')
    })
    expect(replaceMock).not.toHaveBeenCalledWith('/project')
  })

  it('shows already used banner and login form when confirmation link was consumed', async () => {
    routeQuery.value = { token: 'used-token' }
    activateWithTokenMock.mockResolvedValue('alreadyUsed')
    const wrapper = await mountSuspended(LoginPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="expired-banner"]').text()).toBe('login.linkAlreadyUsed')
      expect(wrapper.find('form').exists()).toBe(true)
      expect(replaceMock).toHaveBeenCalledWith('/login')
    })
    expect(replaceMock).not.toHaveBeenCalledWith('/project')
  })
})

describe('login page form submit', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    requestMagicLinkMock.mockReset()
    requestMagicLinkMock.mockResolvedValue(undefined)
    routeQuery.value = {}
  })

  it('submits magic link request on form submit', async () => {
    const wrapper = await mountSuspended(LoginPage)
    await vi.waitFor(() => {
      expect(wrapper.find('form').exists()).toBe(true)
    })
    await wrapper.find('#email').setValue('user@example.com')
    await wrapper.find('form').trigger('submit')

    expect(requestMagicLinkMock).toHaveBeenCalledWith('user@example.com')
  })
})
