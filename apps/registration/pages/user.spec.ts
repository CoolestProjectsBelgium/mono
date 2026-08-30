import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { userFixture } from '~/fixtures/user'
import { activeSettingsFixture } from '~/fixtures/settings'
import UserPage from './user.vue'

const { fetchUserMock, fetchSettingsMock, fetchTshirtsMock, fetchDojosMock, updateUserMock } = vi.hoisted(() => ({
  fetchUserMock: vi.fn(),
  fetchSettingsMock: vi.fn(),
  fetchTshirtsMock: vi.fn(),
  fetchDojosMock: vi.fn(),
  updateUserMock: vi.fn(),
}))

vi.mock('~/composables/useUserinfo', () => ({
  useUserinfo: () => ({
    fetchUser: fetchUserMock,
    updateUser: updateUserMock,
    deleteUser: vi.fn(),
    getProfileState: (user: unknown) => (user ? 'ready' : 'unavailable'),
  }),
}))

vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    fetchSettings: fetchSettingsMock,
  }),
}))

vi.mock('~/composables/useRegistration', () => ({
  useRegistration: () => ({
    fetchTshirts: fetchTshirtsMock,
    fetchDojos: fetchDojosMock,
  }),
}))

vi.mock('~/composables/useNotification', () => ({
  useNotification: () => ({
    notify: vi.fn(),
  }),
}))

vi.mock('~/components/ApiUnavailableBanner.vue', () => ({
  default: {
    props: ['messageKey'],
    template: '<p data-testid="unavailable-banner">{{ messageKey }}</p>',
  },
}))

vi.mock('~/components/ValidationAlert.vue', () => ({
  default: {
    props: ['fieldErrors', 'apiMessage'],
    template: '<div data-testid="validation-alert" />',
  },
}))

vi.mock('~/components/CtaButton.vue', () => ({
  default: {
    template: '<button><slot /></button>',
  },
}))

mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
  te: () => false,
  locale: { value: 'nl' },
}))

describe('user page profile load', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAuthStore().setExpires('2099-01-01T00:00:00.000Z')
    fetchUserMock.mockReset()
    fetchSettingsMock.mockReset()
    fetchTshirtsMock.mockReset()
    fetchDojosMock.mockReset()
    fetchSettingsMock.mockResolvedValue(activeSettingsFixture)
    fetchTshirtsMock.mockResolvedValue([
      { group: 'kids', items: [{ id: 1, name: 'kid_3-4' }, { id: 2, name: 'kid_5-6' }] },
    ])
    fetchDojosMock.mockResolvedValue([{ id: 1, name: 'Balen' }])
  })

  it('shows personal info from API in form fields', async () => {
    fetchUserMock.mockResolvedValue(userFixture)

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    const firstname = wrapper.find('#firstname')
    expect(firstname.exists()).toBe(true)
    expect((firstname.element as HTMLInputElement).value).toBe('Test')
    expect((wrapper.find('#lastname').element as HTMLInputElement).value).toBe('User')
  })

  it('shows the email address but does not allow editing it', async () => {
    fetchUserMock.mockResolvedValue(userFixture)

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    const email = wrapper.find('#email')
    expect((email.element as HTMLInputElement).value).toBe('test@example.com')
    expect((email.element as HTMLInputElement).disabled).toBe(true)
    expect(wrapper.find('[data-testid="email-locked-hint"]').exists()).toBe(true)
  })

  it('shows stored dojo affiliation', async () => {
    fetchUserMock.mockResolvedValue({
      ...userFixture,
      via_type: 'dojo',
      via: 'Dojo Balen',
    })

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    const via = wrapper.find('#via')
    expect(via.exists()).toBe(true)
    expect((via.element as HTMLInputElement).value).toBe('Balen')
  })

  it('shows t-shirt size options from API', async () => {
    fetchUserMock.mockResolvedValue(userFixture)

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    const options = wrapper.findAll('#t_size option')
    expect(options.length).toBeGreaterThan(1)
    expect(options.some(o => o.text() === 'kid_3-4')).toBe(true)
  })

  it('shows pleaseWait while profile is loading', async () => {
    fetchUserMock.mockImplementation(() => new Promise(() => {}))

    const wrapper = await mountSuspended(UserPage)

    expect(wrapper.find('[data-testid="profile-loading"]').exists()).toBe(true)
    expect(wrapper.find('#firstname').exists()).toBe(false)
  })

  it('shows unavailable banner when profile fetch fails', async () => {
    fetchUserMock.mockRejectedValue(new Error('Network error'))

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="unavailable-banner"]').text()).toBe('apiUnavailable.userinfo')
    expect(wrapper.find('#firstname').exists()).toBe(false)
  })

  it('shows unavailable banner when profile is null', async () => {
    fetchUserMock.mockResolvedValue(null)

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    expect(wrapper.get('[data-testid="unavailable-banner"]').text()).toBe('apiUnavailable.userinfo')
    expect(wrapper.find('#firstname').exists()).toBe(false)
  })

  it('does not submit when Enter is pressed in a text field', async () => {
    fetchUserMock.mockResolvedValue(userFixture)
    updateUserMock.mockReset()

    const wrapper = await mountSuspended(UserPage)
    await flushPromises()

    await wrapper.find('#firstname').trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(updateUserMock).not.toHaveBeenCalled()
  })
})
