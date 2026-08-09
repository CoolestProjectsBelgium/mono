import { describe, expect, it, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

vi.mock('~/utils/attachment-normalize', () => ({
  normalizeUploadFile: vi.fn(async (file: File) => ({
    file,
    filename: file.name,
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

  it('getPreviewUrl builds the authenticated thumbnail API path', async () => {
    const { getPreviewUrl } = await callComposable(() => useAttachments())
    expect(getPreviewUrl({
      id: '12',
      name: 'Photo',
      thumbnailUrl: 'https://example.test/ignored',
    })).toBe('/_api/projectinfo/attachments/12')
  })

  it('fetchThumbnailObjectUrl delegates to the thumbnail helper', async () => {
    const blob = new Blob(['webp'], { type: 'image/webp' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    }))
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:thumb-12'),
      revokeObjectURL: vi.fn(),
    })

    const { fetchThumbnailObjectUrl } = await callComposable(() => useAttachments())
    await expect(fetchThumbnailObjectUrl('12')).resolves.toBe('blob:thumb-12')
  })
})
