import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ProjectPage from './project.vue'
import type { ProjectDto } from '~/types/api'

const {
  fetchProjectMock,
  leaveProjectMock,
  deleteProjectMock,
  navigateToMock,
  notifyMock,
} = vi.hoisted(() => ({
  fetchProjectMock: vi.fn(),
  leaveProjectMock: vi.fn(),
  deleteProjectMock: vi.fn(),
  navigateToMock: vi.fn(),
  notifyMock: vi.fn(),
}))

vi.mock('~/composables/useProjectinfo', () => ({
  useProjectinfo: () => ({
    fetchProject: fetchProjectMock,
    updateProject: vi.fn(),
    deleteProject: deleteProjectMock,
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
      <div v-if="open" :data-testid="title === 'deleteProject.title' ? 'delete-dialog' : 'leave-dialog'">
        <button data-testid="confirm-dialog" @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    `,
  },
}))

vi.mock('~/components/FormSection.vue', () => ({
  default: {
    props: ['title'],
    template: '<section><h2>{{ title }}</h2><slot /></section>',
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
    participants: [
      { id: 1, name: 'Alex', self: false, is_owner: true, status: 'registered' },
      { id: 11, name: 'Sam', self: true, is_owner: false, status: 'registered' },
      { id: 10, name: '', self: false, is_owner: false, status: 'pending' },
    ],
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

  it('shows owner-only notice and participant list for coworkers', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Alleen de projecteigenaar kan de projectinstellingen aanpassen')
      expect(wrapper.text()).toContain('Alex')
      expect(wrapper.text()).toContain('Projecteigenaar')
      expect(wrapper.text()).toContain('Sam')
      expect(wrapper.text()).toContain('Jij')
    })
  })

  it('leaves project after confirmation and navigates to no_project', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="leave-project-button"]').exists()).toBe(true)
    })

    await wrapper.get('[data-testid="leave-project-button"]').trigger('click')
    await wrapper.get('[data-testid="confirm-dialog"]').trigger('click')

    await vi.waitFor(() => {
      expect(leaveProjectMock).toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith('/no_project')
      expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
    })
  })
})

const ownerProject: ProjectDto = {
  is_owner: true,
  own_project: {
    project_id: '1',
    project_name: 'My project',
    project_descr: 'Description',
    project_type: 'game',
    project_lang: 'nl',
    delete_possible: true,
    participants: [],
  },
}

describe('project page owner delete', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchProjectMock.mockReset()
    deleteProjectMock.mockReset()
    navigateToMock.mockReset()
    notifyMock.mockReset()
    fetchProjectMock.mockResolvedValue(ownerProject)
    deleteProjectMock.mockResolvedValue(true)
    navigateToMock.mockResolvedValue(undefined)
  })

  it('shows delete button with action label', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="delete-project-button"]').exists()).toBe(true)
      expect(wrapper.get('[data-testid="delete-project-button"]').text()).not.toContain('wordt verwijderd')
    })
  })

  it('deletes project after confirmation', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="delete-project-button"]').exists()).toBe(true)
    })

    await wrapper.get('[data-testid="delete-project-button"]').trigger('click')
    await wrapper.get('[data-testid="confirm-dialog"]').trigger('click')

    await vi.waitFor(() => {
      expect(deleteProjectMock).toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith('/no_project')
      expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
    })
  })
})
