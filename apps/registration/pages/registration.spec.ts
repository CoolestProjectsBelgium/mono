import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { userFixture } from '~/fixtures/user'
import { activeSettingsFixture } from '~/fixtures/settings'
import { mockFetch } from '~/tests/setup'
import RegistrationPage from './registration/index.vue'

const {
  navigateToMock,
  setRegistrationSuccessMock,
  joinProjectMock,
  notifyMock,
  routeQuery,
} = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  setRegistrationSuccessMock: vi.fn(),
  joinProjectMock: vi.fn(),
  notifyMock: vi.fn(),
  routeQuery: { value: {} as Record<string, string> },
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRoute', () => () => ({ query: routeQuery.value }))
vi.stubGlobal('useLocalePath', () => (path: string) => path)

vi.mock('~/utils/registration-success', () => ({
  setRegistrationSuccess: (...args: unknown[]) => setRegistrationSuccessMock(...args),
}))

vi.mock('~/composables/useParticipant', () => ({
  useParticipant: () => ({
    joinProject: joinProjectMock,
  }),
}))

vi.mock('~/composables/useNotification', () => ({
  useNotification: () => ({
    notify: notifyMock,
  }),
}))

const validForm = {
  user: { ...userFixture, year: 2009, month: 6 },
  isOwnProject: true as const,
  ownProject: {
    project_name: 'My Project',
    project_descr: 'Description',
    project_type: 'Scratch',
    project_lang: 'nl' as const,
  },
  otherProject: { project_code: '' },
  mandatoryApprovals: ['1'],
  answeredGeneralQuestionIds: [] as string[],
}

describe('registration page submit', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    navigateToMock.mockReset()
    setRegistrationSuccessMock.mockReset()
    joinProjectMock.mockReset()
    notifyMock.mockReset()
    routeQuery.value = {}
    joinProjectMock.mockResolvedValue(true)
    navigateToMock.mockResolvedValue(undefined)
    mockFetch.mockReset()
    mockFetch.mockImplementation((url: string) => {
      if (url === '/csrf-token') return Promise.resolve({ csrfToken: 'csrf-token' })
      if (url === '/settings') return Promise.resolve(activeSettingsFixture)
      if (url === '/tshirts') return Promise.resolve([])
      if (url === '/questions') return Promise.resolve([])
      if (url === '/approvals') return Promise.resolve([{ id: 1, name: 'Rules', description: 'Agree' }])
      if (url === '/dojos') return Promise.resolve([{ id: 1, name: 'Balen' }])
      if (url === '/registration') return Promise.resolve({})
      return Promise.resolve(null)
    })
  })

  it('does not submit when Enter is pressed in a text field', async () => {
    const draft = useRegistrationDraftStore(pinia)
    draft.form = { ...validForm }

    const wrapper = await mountSuspended(RegistrationPage, {
      global: { plugins: [pinia] },
    })
    await vi.waitFor(() => {
      expect(wrapper.find('form').exists()).toBe(true)
    })
    await flushPromises()

    const firstInput = wrapper.find('#firstname')
    expect(firstInput.exists()).toBe(true)
    await firstInput.trigger('keydown', { key: 'Enter' })
    await flushPromises()

    expect(mockFetch).not.toHaveBeenCalledWith('/registration', expect.any(Object))
  })

  it('navigates to success page with email on successful submit', async () => {
    const draft = useRegistrationDraftStore(pinia)
    draft.form = { ...validForm }

    const wrapper = await mountSuspended(RegistrationPage, {
      global: { plugins: [pinia] },
    })
    await vi.waitFor(() => {
      expect(wrapper.find('form').exists()).toBe(true)
    })
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/approvals', expect.any(Object))
    }, { timeout: 3000 })
    await flushPromises()

    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/registration', expect.objectContaining({ method: 'POST' }))
    }, { timeout: 3000 })
    expect(setRegistrationSuccessMock).toHaveBeenCalledWith('test@example.com')
    expect(navigateToMock).toHaveBeenCalledWith('/registration/success')
  })
})

describe('registration page logged-in voucher join', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    navigateToMock.mockReset()
    joinProjectMock.mockReset()
    notifyMock.mockReset()
    routeQuery.value = { token: 'invite-token' }
    joinProjectMock.mockResolvedValue(true)
    navigateToMock.mockResolvedValue(undefined)
    const authStore = useAuthStore(pinia)
    authStore.setSession({
      expires: new Date(Date.now() + 60_000).toISOString(),
      language: 'nl',
    })
  })

  it('joins immediately when logged in with invite token', async () => {
    const wrapper = await mountSuspended(RegistrationPage, {
      global: { plugins: [pinia] },
    })
    await vi.waitFor(() => {
      expect(joinProjectMock).toHaveBeenCalledWith('invite-token')
    })
    expect(wrapper.find('form').exists()).toBe(false)
    expect(navigateToMock).toHaveBeenCalledWith('/project')
    expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
  })

  it('shows join panel with error when redeem fails', async () => {
    joinProjectMock.mockRejectedValueOnce({
      data: { message: 'User already has a project' },
    })

    const wrapper = await mountSuspended(RegistrationPage, {
      global: { plugins: [pinia] },
    })
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="join-voucher-panel"]').exists()).toBe(true)
    })
    expect(wrapper.find('form').exists()).toBe(false)
    expect(navigateToMock).not.toHaveBeenCalled()
    expect(notifyMock).toHaveBeenCalledWith(
      'error',
      'error_An error occurred',
      undefined,
      expect.stringContaining('project'),
    )
  })
})
