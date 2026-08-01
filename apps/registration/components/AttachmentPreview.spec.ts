import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentPreview from './AttachmentPreview.vue'

describe('AttachmentPreview', () => {
  it('renders thumbnail preview', async () => {
    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        name: 'photo.png',
        thumbnailUrl: 'https://example.test/photo.png',
        unavailableLabel: 'No preview',
      },
    })

    expect(wrapper.get('[data-testid="attachment-preview-image"]').exists()).toBe(true)
  })

  it('shows unavailable placeholder when thumbnail is missing', async () => {
    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        name: 'photo.png',
        thumbnailUrl: null,
        unavailableLabel: 'No preview',
      },
    })

    expect(wrapper.get('[data-testid="attachment-preview-unavailable"]').text()).toContain('No preview')
  })
})
