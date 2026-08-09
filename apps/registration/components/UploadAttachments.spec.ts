import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UploadAttachments from './UploadAttachments.vue'

const uploadFile = vi.fn()

vi.mock('~/composables/useAttachments', () => ({
  useAttachments: () => ({ uploadFile }),
}))

vi.mock('~/composables/useNotification', () => ({
  useNotification: () => ({ notify: vi.fn() }),
}))

describe('UploadAttachments', () => {
  const defaultProps = {
    maxUploadSize: 1024,
    attachmentCount: 0,
    maxAttachments: 10,
  }

  beforeEach(() => {
    uploadFile.mockReset()
  })

  it('does not show a display-name field', async () => {
    const wrapper = await mountSuspended(UploadAttachments, {
      props: defaultProps,
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.find('[data-testid="attachment-display-name"]').exists()).toBe(false)
  })

  it('shows inline error for oversized file without uploading', async () => {
    const wrapper = await mountSuspended(UploadAttachments, {
      props: { ...defaultProps, maxUploadSize: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const file = new File(['01234567890'], 'big.jpg', { type: 'image/jpeg' })
    const input = wrapper.find('[data-testid="photo-file-input"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(uploadFile).not.toHaveBeenCalled()
    expect(wrapper.find('.form-error-text').exists()).toBe(true)
  })

  it('rejects video files without uploading', async () => {
    const wrapper = await mountSuspended(UploadAttachments, {
      props: defaultProps,
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const file = new File(['ok'], 'clip.mp4', { type: 'video/mp4' })
    const input = wrapper.find('[data-testid="photo-file-input"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(uploadFile).not.toHaveBeenCalled()
    expect(wrapper.find('.form-error-text').exists()).toBe(true)
  })

  it('uploads valid image files', async () => {
    uploadFile.mockResolvedValue({ ok: true })

    const wrapper = await mountSuspended(UploadAttachments, {
      props: defaultProps,
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const file = new File(['ok'], 'photo.jpg', { type: 'image/jpeg' })
    const input = wrapper.find('[data-testid="photo-file-input"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(uploadFile).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        onProgress: expect.any(Function),
        onPhase: expect.any(Function),
      }),
    )
  })

  it('blocks upload when attachment limit is reached', async () => {
    const wrapper = await mountSuspended(UploadAttachments, {
      props: { ...defaultProps, attachmentCount: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    expect(wrapper.get('[data-testid="upload-limit-reached"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="photo-file-input"]').attributes('disabled')).toBeDefined()

    const file = new File(['ok'], 'photo.jpg', { type: 'image/jpeg' })
    const input = wrapper.find('[data-testid="photo-file-input"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(uploadFile).not.toHaveBeenCalled()
  })
})
