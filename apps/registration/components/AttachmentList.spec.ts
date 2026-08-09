import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentList from './AttachmentList.vue'
import type { AttachmentDto } from '~/types/api'

const deleteAttachment = vi.fn()
const fetchThumbnailObjectUrl = vi.fn()
const notify = vi.fn()

vi.mock('~/composables/useAttachments', () => ({
  useAttachments: () => ({
    deleteAttachment,
    fetchThumbnailObjectUrl,
  }),
}))

vi.mock('~/composables/useNotification', () => ({
  useNotification: () => ({ notify }),
}))

vi.mock('~/components/ConfirmDialog.vue', () => ({
  default: {
    props: ['open', 'title', 'message', 'confirmLabel', 'cancelLabel', 'loading'],
    emits: ['confirm', 'update:open'],
    template: `
      <div v-if="open" data-testid="delete-dialog">
        <button data-testid="confirm-delete" @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    `,
  },
}))

const sampleAttachment: AttachmentDto = {
  id: '12',
  name: 'project-photo.jpg',
  thumbnailUrl: 'https://example.test/thumb/12',
}

describe('AttachmentList', () => {
  beforeEach(() => {
    deleteAttachment.mockReset()
    fetchThumbnailObjectUrl.mockReset()
    notify.mockReset()
    vi.stubGlobal('open', vi.fn())
    fetchThumbnailObjectUrl.mockResolvedValue('blob:thumb-12')
  })

  it('shows empty state when there are no attachments', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [], maxAttachments: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.get('[data-testid="attachments-empty"]').exists()).toBe(true)
  })

  it('renders attachment rows with preview column', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment], maxAttachments: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.findAll('[data-testid="attachment-row"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('project-photo.jpg')
    expect(wrapper.get('[data-testid="attachment-preview"]').exists()).toBe(true)
  })

  it('deletes an attachment after confirmation', async () => {
    deleteAttachment.mockResolvedValue(true)
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment], maxAttachments: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    await wrapper.get('[data-testid="attachment-delete"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="confirm-delete"]').trigger('click')
    await flushPromises()

    expect(deleteAttachment).toHaveBeenCalledWith('12')
    expect(notify).toHaveBeenCalledWith('success', 'message_successChange')
  })

  it('opens lightbox from preview button', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment], maxAttachments: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    await wrapper.get('[data-testid="attachment-preview-button"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="attachment-lightbox"]').exists()).toBe(true)
  })
})
