import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ProjectPage from './project.vue'
import type { ProjectDto } from '~/types/api'

const {
  fetchProjectMock,
  leaveProjectMock,
  navigateToMock,
  notifyMock,
} = vi.hoisted(() => ({
  fetchProjectMock: vi.fn(),
  leaveProjectMock: vi.fn(),
  navigateToMock: vi.fn(),
  notifyMock: vi.fn(),
}))

vi.mock('~/composables/useProjectinfo', () => ({
  useProjectinfo: () => ({
    fetchProject: fetchProjectMock,
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  }),
}))

vi.mock('~/composables/useParticipant', () => ({
  useParticipant: () => ({
    generateInviteToken: vi.fn(),
    removeParticipant: vi.fn(),
    leaveProject: leaveProjectMock,
    copyInviteUrl: vi.fn(),
    openInviteMailto: vi.fn(),
  }),
}))

vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    fetchSettings: vi.fn().mockResolvedValue({ maxParticipants: 4 }),
  }),
}))

vi.mock('~/composables/useNotification', () => ({
  useNotification: () => ({
    notify: notifyMock,
  }),
}))

vi.mock('~/components/ValidationAlert.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('~/components/ApiUnavailableBanner.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('~/components/OwnProjectForm.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('~/components/OwnParticipants.vue', () => ({
  default: { template: '<div />' },
}))

vi.mock('~/components/CtaButton.vue', () => ({
  default: {
    props: ['disabled'],
    emits: ['click'],
    template: '<button type="button" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  },
}))

vi.mock('~/components/ConfirmDialog.vue', () => ({
  default: {
    props: ['open', 'title', 'message', 'confirmLabel', 'cancelLabel', 'loading'],
    emits: ['confirm', 'update:open'],
    template: `
      <div v-if="open" data-testid="leave-dialog">
        <button data-testid="confirm-leave" @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    `,
  },
}))

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useLocalePath', () => () => (path: string) => path)
mockNuxtImport('useI18n', () => () => ({
  t: (key: string) => key,
}))

const coworkerProject: ProjectDto = {
  is_owner: false,
  own_project: {
    project_id: '7',
    project_name: 'Team project',
    project_descr: 'Built together',
    project_type: 'game',
    project_lang: 'nl',
  },
}

describe('project page coworker leave', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchProjectMock.mockReset()
    leaveProjectMock.mockReset()
    navigateToMock.mockReset()
    notifyMock.mockReset()
    fetchProjectMock.mockResolvedValue(coworkerProject)
    leaveProjectMock.mockResolvedValue(true)
    navigateToMock.mockResolvedValue(undefined)
  })

  it('shows leave button for coworkers', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="leave-project-button"]').exists()).toBe(true)
    })
  })

  it('leaves project after confirmation and navigates to no_project', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="leave-project-button"]').exists()).toBe(true)
    })

    await wrapper.get('[data-testid="leave-project-button"]').trigger('click')
    await wrapper.get('[data-testid="confirm-leave"]').trigger('click')

    await vi.waitFor(() => {
      expect(leaveProjectMock).toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith('/no_project')
      expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
    })
  })
})
