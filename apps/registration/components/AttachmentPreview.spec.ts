import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentPreview from './AttachmentPreview.vue'

describe('AttachmentPreview', () => {
  it('renders image preview', async () => {
    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        filename: 'photo.png',
        url: 'https://example.test/photo.png',
        exists: true,
        unavailableLabel: 'No preview',
      },
    })

    expect(wrapper.get('[data-testid="attachment-preview-image"]').exists()).toBe(true)
  })

  it('renders video poster when available', async () => {
    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        filename: 'clip.mp4',
        url: 'https://example.test/clip.mp4',
        posterUrl: 'https://example.test/clip.poster.jpg',
        exists: true,
        unavailableLabel: 'No preview',
      },
    })

    expect(wrapper.get('[data-testid="attachment-preview-poster"]').exists()).toBe(true)
  })

  it('shows unavailable placeholder when blob is missing', async () => {
    const wrapper = await mountSuspended(AttachmentPreview, {
      props: {
        filename: 'photo.png',
        url: null,
        exists: false,
        unavailableLabel: 'No preview',
      },
    })

    expect(wrapper.get('[data-testid="attachment-preview-unavailable"]').text()).toContain('No preview')
  })
})
