import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentList from './AttachmentList.vue'
import type { AttachmentDto } from '~/types/api'

const deleteAttachment = vi.fn()
const getDownloadUrl = vi.fn()
const renameAttachment = vi.fn()
const notify = vi.fn()

vi.mock('~/composables/useAttachments', () => ({
  useAttachments: () => ({
    deleteAttachment,
    getDownloadUrl,
    renameAttachment,
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
  id: 'uuid-1.mp4',
  name: 'My movie',
  filename: 'clip.mp4',
  size: 1024,
  confirmed: false,
  exists: true,
  type: 'movie',
  url: 'https://example.test/blob/uuid-1.mp4?sas=1',
}

describe('AttachmentList', () => {
  beforeEach(() => {
    deleteAttachment.mockReset()
    getDownloadUrl.mockReset()
    renameAttachment.mockReset()
    notify.mockReset()
    vi.stubGlobal('open', vi.fn())
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
    expect(wrapper.text()).toContain('clip.mp4')
    expect(wrapper.get('[data-testid="attachment-preview"]').exists()).toBe(true)
  })

  it('shows orphaned badge when exists is false', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: {
        attachments: [{ ...sampleAttachment, exists: false, url: null }],
        maxAttachments: 10,
      },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.get('[data-testid="attachment-orphaned"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="attachment-download"]').exists()).toBe(false)
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

    expect(deleteAttachment).toHaveBeenCalledWith('uuid-1.mp4')
    expect(notify).toHaveBeenCalledWith('success', 'message_successChange')
  })

  it('opens lightbox from download button', async () => {
    getDownloadUrl.mockResolvedValue('https://example.test/blob/uuid-1.mp4?sas=1')

    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment], maxAttachments: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    await wrapper.get('[data-testid="attachment-download"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="attachment-lightbox"]').exists()).toBe(true)
  })

  it('renames an attachment inline', async () => {
    renameAttachment.mockResolvedValue(true)
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment], maxAttachments: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    await wrapper.get('[data-testid="attachment-rename-start"]').trigger('click')
    await flushPromises()
    await wrapper.get('[data-testid="attachment-rename-input"]').setValue('Renamed clip')
    await flushPromises()
    await wrapper.get('[data-testid="attachment-rename-save"]').trigger('click')
    await flushPromises()

    expect(renameAttachment).toHaveBeenCalledWith('uuid-1.mp4', 'Renamed clip')
  })
})
