import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import UploadPage from './upload.vue'
import type { AttachmentDto, ProjectDto } from '~/types/api'

const { fetchProjectMock, fetchSettingsMock, navigateToMock } = vi.hoisted(() => ({
  fetchProjectMock: vi.fn(),
  fetchSettingsMock: vi.fn(),
  navigateToMock: vi.fn(),
}))

vi.mock('~/composables/useProjectinfo', () => ({
  useProjectinfo: () => ({
    fetchProject: fetchProjectMock,
  }),
}))

vi.mock('~/composables/useSettings', () => ({
  useSettings: () => ({
    fetchSettings: fetchSettingsMock,
  }),
}))

mockNuxtImport('navigateTo', () => navigateToMock)

vi.mock('~/components/UploadAttachments.vue', () => ({
  default: {
    props: ['maxUploadSize', 'attachmentCount', 'maxAttachments'],
    emits: ['upload-start', 'upload-end', 'upload-success'],
    template: '<div data-testid="upload-form" />',
  },
}))

vi.mock('~/composables/useAttachments', () => ({
  useAttachments: () => ({
    fetchAttachments: vi.fn().mockResolvedValue([
      { id: '1', name: 'Movie', thumbnailUrl: '/thumb/1' },
    ]),
  }),
}))

vi.mock('~/components/AttachmentList.vue', () => ({
  default: {
    props: ['attachments', 'maxAttachments', 'disabled'],
    emits: ['deleted'],
    template: '<div data-testid="attachment-list">{{ attachments.length }}</div>',
  },
}))

const ownerProject: ProjectDto = {
  is_owner: true,
  own_project: {
    project_name: 'Test',
    project_descr: 'Desc',
    project_type: 'Type',
    project_lang: 'nl',
  },
  attachments: [
    {
      id: '1',
      name: 'Movie',
      thumbnailUrl: '/thumb/1',
    } satisfies AttachmentDto,
  ],
}

describe('upload page', () => {
  beforeEach(() => {
    fetchProjectMock.mockReset()
    fetchSettingsMock.mockReset()
    navigateToMock.mockReset()
    fetchSettingsMock.mockResolvedValue({ maxUploadSize: 1024, maxAttachments: 10 })
  })

  it('redirects non-owners to project page', async () => {
    fetchProjectMock.mockResolvedValue({
      is_owner: false,
      own_project: ownerProject.own_project,
    })

    await mountSuspended(UploadPage)

    expect(navigateToMock).toHaveBeenCalled()
  })

  it('shows attachment list for project owners', async () => {
    fetchProjectMock.mockResolvedValue(ownerProject)

    const wrapper = await mountSuspended(UploadPage)
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[data-testid="upload-form"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="attachment-list"]').text()).toBe('1')
  })
})
