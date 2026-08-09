import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  buildAttachmentThumbnailPath,
  clearAttachmentThumbnailCache,
  fetchAttachmentThumbnailObjectUrl,
  revokeAttachmentThumbnailObjectUrl,
} from './attachment-thumbnail'

describe('attachment-thumbnail', () => {
  const revokeObjectURL = vi.fn()
  const createObjectURL = vi.fn(() => 'blob:thumb-1')

  beforeEach(() => {
    clearAttachmentThumbnailCache()
    vi.restoreAllMocks()
    revokeObjectURL.mockReset()
    createObjectURL.mockReset()
    createObjectURL.mockReturnValue('blob:thumb-1')
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  })

  it('builds the thumbnail API path', () => {
    expect(buildAttachmentThumbnailPath('12')).toBe('/projectinfo/attachments/12')
  })

  it('fetches an authenticated thumbnail as a blob URL', async () => {
    const blob = new Blob(['webp'], { type: 'image/webp' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    }))

    const url = await fetchAttachmentThumbnailObjectUrl('/_api', '1')
    expect(url).toBe('blob:thumb-1')
    expect(fetch).toHaveBeenCalledWith(
      '/_api/projectinfo/attachments/1',
      { credentials: 'include' },
    )
  })

  it('caches blob URLs per attachment id', async () => {
    const blob = new Blob(['webp'], { type: 'image/webp' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchAttachmentThumbnailObjectUrl('/_api', '1')
    await fetchAttachmentThumbnailObjectUrl('/_api', '1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('revokes cached blob URLs', async () => {
    const blob = new Blob(['webp'], { type: 'image/webp' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => blob,
    }))

    await fetchAttachmentThumbnailObjectUrl('/_api', '1')
    revokeAttachmentThumbnailObjectUrl('1')

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:thumb-1')
    expect(await fetchAttachmentThumbnailObjectUrl('/_api', '1')).toBe('blob:thumb-1')
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
