import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AttachmentLightbox from './AttachmentLightbox.vue'

describe('AttachmentLightbox', () => {
  it('renders image when open', async () => {
    const wrapper = await mountSuspended(AttachmentLightbox, {
      props: {
        open: true,
        url: 'https://example.test/photo.png',
        filename: 'photo.png',
        mediaKind: 'image',
        closeLabel: 'Close',
      },
    })

    expect(wrapper.get('[data-testid="attachment-lightbox-image"]').exists()).toBe(true)
  })

  it('renders video when open', async () => {
    const wrapper = await mountSuspended(AttachmentLightbox, {
      props: {
        open: true,
        url: 'https://example.test/clip.mp4',
        filename: 'clip.mp4',
        mediaKind: 'video',
        closeLabel: 'Close',
      },
    })

    expect(wrapper.get('[data-testid="attachment-lightbox-video"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="attachment-lightbox-close"]').exists()).toBe(true)
  })
})
