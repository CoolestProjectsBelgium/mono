import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import { userFixture } from '~/fixtures/user'
import { activeSettingsFixture } from '~/fixtures/settings'
import { mockFetch } from '~/tests/setup'
import RegistrationPage from './registration/index.vue'

const { navigateToMock, setRegistrationSuccessMock } = vi.hoisted(() => ({
  navigateToMock: vi.fn(),
  setRegistrationSuccessMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)
vi.stubGlobal('useLocalePath', () => (path: string) => path)

vi.mock('~/utils/registration-success', () => ({
  setRegistrationSuccess: (...args: unknown[]) => setRegistrationSuccessMock(...args),
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
    mockFetch.mockReset()
    mockFetch.mockImplementation((url: string) => {
      if (url === '/settings') return Promise.resolve(activeSettingsFixture)
      if (url === '/tshirts') return Promise.resolve([])
      if (url === '/questions') return Promise.resolve([])
      if (url === '/approvals') return Promise.resolve([{ id: 1, name: 'Rules', description: 'Agree' }])
      if (url === '/registration') return Promise.resolve({})
      return Promise.resolve(null)
    })
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
