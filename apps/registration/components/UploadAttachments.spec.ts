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
  beforeEach(() => {
    uploadFile.mockReset()
  })

  it('shows inline error for oversized file without uploading', async () => {
    const wrapper = await mountSuspended(UploadAttachments, {
      props: { maxUploadSize: 10 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const file = new File(['01234567890'], 'big.mp4', { type: 'video/mp4' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(uploadFile).not.toHaveBeenCalled()
    expect(wrapper.find('.form-error-text').exists()).toBe(true)
  })

  it('uploads valid files', async () => {
    uploadFile.mockResolvedValue({ ok: true })

    const wrapper = await mountSuspended(UploadAttachments, {
      props: { maxUploadSize: 1024 },
      global: {
        stubs: {
          FormSection: { template: '<div><slot /></div>', props: ['title'] },
        },
      },
    })

    const file = new File(['ok'], 'clip.mp4', { type: 'video/mp4' })
    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    await wrapper.vm.$nextTick()

    expect(uploadFile).toHaveBeenCalledWith(file, expect.any(Function))
  })
})
