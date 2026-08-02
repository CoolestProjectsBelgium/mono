import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createI18n } from 'vue-i18n'
import RegistrationSuccessPage from './success.vue'

const { navigateToMock, consumeRegistrationSuccessMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  consumeRegistrationSuccessMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
vi.stubGlobal('useLocalePath', () => (path: string) => path)

vi.mock('~/utils/registration-success', () => ({
  consumeRegistrationSuccess: () => consumeRegistrationSuccessMock(),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      registrationSuccess: {
        title: 'Check your email',
        body: 'We sent a confirmation link to {email}. Click the link in that email to continue.',
        loginCta: 'Login',
        homeCta: 'Back to homepage',
      },
    },
  },
})

describe('registration success page', () => {
  beforeEach(() => {
    navigateToMock.mockReset()
    consumeRegistrationSuccessMock.mockReset()
  })

  it('redirects when flash is absent', async () => {
    consumeRegistrationSuccessMock.mockReturnValue(null)
    await mountSuspended(RegistrationSuccessPage, {
      global: { plugins: [i18n] },
    })
    await vi.waitFor(() => {
      expect(navigateToMock).toHaveBeenCalledWith('/registration')
    })
  })

  it('renders title and email when flash is present', async () => {
    consumeRegistrationSuccessMock.mockReturnValue({ email: 'you@example.com' })
    const wrapper = await mountSuspended(RegistrationSuccessPage, {
      global: { plugins: [i18n] },
    })
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Check your email')
      expect(wrapper.text()).toContain('you@example.com')
    })
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
