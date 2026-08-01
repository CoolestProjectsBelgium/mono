import { describe, expect, it, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

vi.mock('~/utils/attachment-normalize', () => ({
  normalizeUploadFile: vi.fn(async (file: File) => ({
    file,
    filename: file.name,
    needsServerNormalize: false,
  })),
}))

vi.mock('~/utils/csrf-token', () => ({
  ensureCsrfToken: vi.fn().mockResolvedValue('csrf-token'),
  clearCsrfToken: vi.fn(),
  isUnsafeMethod: (method?: string) => ['POST', 'PUT', 'PATCH', 'DELETE'].includes((method ?? 'GET').toUpperCase()),
}))

describe('useAttachments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('fetchAttachments calls GET /projectinfo/attachments', async () => {
    mockFetch.mockResolvedValue([{ id: '1', name: 'Photo', thumbnailUrl: '/thumb/1' }])
    const { fetchAttachments } = await callComposable(() => useAttachments())
    const result = await fetchAttachments()
    expect(mockFetch).toHaveBeenCalledWith('/projectinfo/attachments', expect.any(Object))
    expect(result).toHaveLength(1)
  })

  it('deleteAttachment returns true on success', async () => {
    mockFetch.mockResolvedValue(null)
    const { deleteAttachment } = await callComposable(() => useAttachments())
    await expect(deleteAttachment('12')).resolves.toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      '/projectinfo/attachments/12',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('deleteAttachment returns false on failure', async () => {
    mockFetch.mockRejectedValue(new Error('fail'))
    const { deleteAttachment } = await callComposable(() => useAttachments())
    await expect(deleteAttachment('12')).resolves.toBe(false)
  })

  it('getPreviewUrl returns thumbnailUrl', async () => {
    const { getPreviewUrl } = await callComposable(() => useAttachments())
    expect(getPreviewUrl({
      id: '1',
      name: 'Photo',
      thumbnailUrl: '/thumb/1',
    })).toBe('/thumb/1')
  })
})
