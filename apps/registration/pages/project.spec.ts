import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { setActivePinia, createPinia } from 'pinia'
import ProjectPage from './project.vue'
import type { ProjectDto } from '~/types/api'

const {
  fetchProjectMock,
  updateProjectMock,
  leaveProjectMock,
  deleteProjectMock,
  changeOwnerMock,
  removeParticipantMock,
  navigateToMock,
  notifyMock,
} = vi.hoisted(() => ({
  fetchProjectMock: vi.fn(),
  updateProjectMock: vi.fn(),
  leaveProjectMock: vi.fn(),
  deleteProjectMock: vi.fn(),
  changeOwnerMock: vi.fn(),
  removeParticipantMock: vi.fn(),
  navigateToMock: vi.fn(),
  notifyMock: vi.fn(),
}))

vi.mock('~/composables/useProjectinfo', () => ({
  useProjectinfo: () => ({
    fetchProject: fetchProjectMock,
    updateProject: updateProjectMock,
    deleteProject: deleteProjectMock,
    changeOwner: changeOwnerMock,
  }),
}))

vi.mock('~/composables/useParticipant', () => ({
  useParticipant: () => ({
    generateInviteToken: vi.fn(),
    removeParticipant: removeParticipantMock,
    leaveProject: leaveProjectMock,
    copyInviteUrl: vi.fn(),
    copyInviteToken: vi.fn(),
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
  default: {
    props: ['modelValue', 'errors'],
    emits: ['update:modelValue', 'clear-error'],
    template: `
      <div>
        <input
          data-testid="project-name-input"
          :value="modelValue.project_name"
          @input="$emit('update:modelValue', { ...modelValue, project_name: $event.target.value })"
        />
      </div>
    `,
  },
}))

vi.mock('~/components/OwnParticipants.vue', () => ({
  default: {
    props: ['participants', 'removingParticipantId', 'changingOwnerId'],
    emits: ['remove', 'changeOwner'],
    template: `
      <div>
        <button
          data-testid="remove-participant"
          @click="$emit('remove', { id: 10, name: '', self: false, status: 'pending', token: 'invite-token' })"
        >
          Remove
        </button>
        <button
          data-testid="change-owner"
          @click="$emit('changeOwner', { id: 11, name: 'Sam', self: false, status: 'registered' })"
        >
          Make owner
        </button>
      </div>
    `,
  },
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
      <div v-if="open">
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
      { id: 11, name: 'Sam', self: true, is_owner: false, status: 'registered', token: 'voucher-guid' },
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
      expect(leaveProjectMock).toHaveBeenCalledWith(11, 'voucher-guid')
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
    updateProjectMock.mockReset()
    deleteProjectMock.mockReset()
    changeOwnerMock.mockReset()
    removeParticipantMock.mockReset()
    navigateToMock.mockReset()
    notifyMock.mockReset()
    fetchProjectMock.mockResolvedValue(ownerProject)
    deleteProjectMock.mockResolvedValue(true)
    changeOwnerMock.mockResolvedValue(undefined)
    removeParticipantMock.mockResolvedValue(undefined)
    navigateToMock.mockResolvedValue(undefined)
  })

  it('shows delete button with action label', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="delete-project-button"]').exists()).toBe(true)
      expect(wrapper.get('[data-testid="delete-project-button"]').text()).not.toContain('wordt verwijderd')
    })
  })

  it('wraps owner project fields in a form for keyboard navigation', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  it('saves edited project name from the form', async () => {
    updateProjectMock.mockResolvedValue({
      is_owner: true,
      own_project: {
        ...ownerProject.own_project!,
        project_name: 'Renamed project',
      },
    })

    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="project-name-input"]').exists()).toBe(true)
    })

    const input = wrapper.get('[data-testid="project-name-input"]')
    await input.setValue('Renamed project')
    await wrapper.get('form').trigger('submit')

    await vi.waitFor(() => {
      expect(updateProjectMock).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: '1',
          project_name: 'Renamed project',
        }),
      )
      expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
      expect(wrapper.get('[data-testid="project-name-input"]').element).toHaveProperty(
        'value',
        'Renamed project',
      )
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

  it('removes participant after confirmation dialog', async () => {
    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="remove-participant"]').exists()).toBe(true)
    })

    await wrapper.get('[data-testid="remove-participant"]').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="confirm-dialog"]').text()).toContain('Verwijderen')
    })
    await wrapper.get('[data-testid="confirm-dialog"]').trigger('click')

    await vi.waitFor(() => {
      expect(removeParticipantMock).toHaveBeenCalledWith({
        id: 10,
        name: '',
        self: false,
        status: 'pending',
        token: 'invite-token',
      })
      expect(fetchProjectMock).toHaveBeenCalledTimes(2)
      expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
    })
  })

  it('transfers ownership after confirmation and refreshes project', async () => {
    const transferredProject: ProjectDto = {
      is_owner: false,
      own_project: {
        ...ownerProject.own_project!,
        delete_possible: false,
        participants: [
          { id: 11, name: 'Sam', self: false, is_owner: true, status: 'registered' },
          { id: 1, name: 'Alex', self: true, is_owner: false, status: 'registered' },
        ],
      },
    }
    fetchProjectMock
      .mockResolvedValueOnce(ownerProject)
      .mockResolvedValueOnce(transferredProject)

    const wrapper = await mountSuspended(ProjectPage)
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="change-owner"]').exists()).toBe(true)
    })

    await wrapper.get('[data-testid="change-owner"]').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.get('[data-testid="confirm-dialog"]').text()).toContain('Maak eigenaar')
    })
    await wrapper.get('[data-testid="confirm-dialog"]').trigger('click')

    await vi.waitFor(() => {
      expect(changeOwnerMock).toHaveBeenCalledWith(11)
      expect(fetchProjectMock).toHaveBeenCalledTimes(2)
      expect(notifyMock).toHaveBeenCalledWith('success', 'message_successChange')
    })
  })
})
