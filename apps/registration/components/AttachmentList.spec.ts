import { describe, expect, it, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentList from './AttachmentList.vue'
import type { AttachmentDto } from '~/types/api'

const deleteAttachment = vi.fn()
const getDownloadUrl = vi.fn()
const notify = vi.fn()

vi.mock('~/composables/useAttachments', () => ({
  useAttachments: () => ({
    deleteAttachment,
    getDownloadUrl,
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
    notify.mockReset()
    vi.stubGlobal('open', vi.fn())
  })

  it('shows empty state when there are no attachments', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [] },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.get('[data-testid="attachments-empty"]').exists()).toBe(true)
  })

  it('renders attachment rows', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment] },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.findAll('[data-testid="attachment-row"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('clip.mp4')
    expect(wrapper.find('[data-testid="attachment-download"]').exists()).toBe(true)
  })

  it('shows orphaned badge when exists is false', async () => {
    const wrapper = await mountSuspended(AttachmentList, {
      props: {
        attachments: [{ ...sampleAttachment, exists: false, url: null }],
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
      props: { attachments: [sampleAttachment] },
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

  it('opens download URL in a new tab', async () => {
    getDownloadUrl.mockResolvedValue('https://example.test/blob/uuid-1.mp4?sas=1')
    const openMock = vi.fn()
    vi.stubGlobal('open', openMock)

    const wrapper = await mountSuspended(AttachmentList, {
      props: { attachments: [sampleAttachment] },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    await wrapper.get('[data-testid="attachment-download"]').trigger('click')
    await wrapper.vm.$nextTick()
    await vi.waitFor(() => {
      expect(openMock).toHaveBeenCalledWith(
        'https://example.test/blob/uuid-1.mp4?sas=1',
        '_blank',
        'noopener,noreferrer',
      )
    })
  })
})
