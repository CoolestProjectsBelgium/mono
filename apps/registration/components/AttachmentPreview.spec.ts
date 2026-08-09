import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentPreview from './AttachmentPreview.vue'

const fetchThumbnailObjectUrl = vi.fn()

vi.mock('~/composables/useAttachments', () => ({
  useAttachments: () => ({ fetchThumbnailObjectUrl }),
}))

describe('AttachmentPreview', () => {
  it('renders thumbnail preview after loading', async () => {
    fetchThumbnailObjectUrl.mockResolvedValue('blob:thumb-1')

    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        attachmentId: '12',
        name: 'photo.png',
        unavailableLabel: 'No preview',
      },
    })

    await flushPromises()

    expect(fetchThumbnailObjectUrl).toHaveBeenCalledWith('12')
    expect(wrapper.get('[data-testid="attachment-preview-image"]').exists()).toBe(true)
  })

  it('shows unavailable placeholder when thumbnail cannot be loaded', async () => {
    fetchThumbnailObjectUrl.mockResolvedValue(null)

    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        attachmentId: '12',
        name: 'photo.png',
        unavailableLabel: 'No preview',
      },
    })

    await flushPromises()

    expect(wrapper.get('[data-testid="attachment-preview-unavailable"]').text()).toContain('No preview')
  })
})
