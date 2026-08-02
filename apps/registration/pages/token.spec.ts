import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import TokenPage from './token.vue'

const {
  joinProjectMock,
  navigateToMock,
  notifyMock,
} = vi.hoisted(() => ({
  joinProjectMock: vi.fn(),
  navigateToMock: vi.fn(),
  notifyMock: vi.fn(),
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

vi.mock('~/components/ValidationAlert.vue', () => ({
  default: {
    props: ['fieldErrors', 'apiMessage', 'summaryKey'],
    template: '<div data-testid="validation-alert"><slot /></div>',
  },
}))

vi.mock('~/components/FormField.vue', () => ({
  default: {
    props: ['fieldId', 'label', 'error'],
    template: `
      <div>
        <label :for="fieldId">{{ label }}</label>
        <slot :input-id="fieldId" input-class="form-input" />
        <p v-if="error" :id="fieldId + '-error'">{{ error }}</p>
      </div>
    `,
  },
}))

vi.mock('~/components/CtaButton.vue', () => ({
  default: {
    props: ['disabled'],
    template: '<button type="submit" :disabled="disabled"><slot /></button>',
  },
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useLocalePath', () => () => (path: string) => path)
mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
}))

describe('token page', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    joinProjectMock.mockReset()
    navigateToMock.mockReset()
    notifyMock.mockReset()
    joinProjectMock.mockResolvedValue(true)
    navigateToMock.mockResolvedValue(undefined)
  })

  it('joins project and navigates to /project on success', async () => {
    const wrapper = await mountSuspended(TokenPage)
    await wrapper.get('#project_code').setValue('invite-token')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(joinProjectMock).toHaveBeenCalledWith('invite-token')
    expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
    expect(navigateToMock).toHaveBeenCalledWith('/project')
  })

  it('shows mapped error and stays on page when join fails', async () => {
    joinProjectMock.mockRejectedValueOnce({
      data: { message: 'User already has a project' },
    })

    const wrapper = await mountSuspended(TokenPage)
    await wrapper.get('#project_code').setValue('invite-token')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(navigateToMock).not.toHaveBeenCalled()
    expect(notifyMock).toHaveBeenCalledWith(
      'error',
      'error_An error occurred',
      undefined,
      'validation_alreadyHasProject',
    )
    expect(wrapper.find('#project_code-error').text()).toBe('validation_alreadyHasProject')
  })
})
