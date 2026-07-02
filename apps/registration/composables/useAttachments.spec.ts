import { describe, expect, it, beforeEach, vi } from 'vitest'
import { callComposable } from '~/tests/composable-utils'
import { mockFetch } from '~/tests/setup'

const mockUploadData = vi.fn().mockResolvedValue(undefined)
let capturedBlobUrl = ''

vi.mock('~/utils/attachment-normalize', () => ({
  normalizeUploadFile: vi.fn(async (file: File) => ({
    file,
    filename: file.name,
    needsServerNormalize: false,
  })),
}))

vi.mock('@azure/storage-blob', () => ({
  AnonymousCredential: vi.fn(),
  BlockBlobClient: vi.fn().mockImplementation((url: string) => {
    capturedBlobUrl = url
    return { uploadData: mockUploadData }
  }),
  newPipeline: vi.fn(),
}))

describe('useAttachments SAS cache', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    mockUploadData.mockClear()
    capturedBlobUrl = ''
  })

  it('isSasStillValid returns false for expired SAS', async () => {
    const { isSasStillValid } = await callComposable(() => useAttachments())
    const past = new Date(Date.now() - 60000).toISOString()
    expect(isSasStillValid(`?se=${encodeURIComponent(past)}&sv=2021`)).toBe(false)
  })

  it('isSasStillValid returns true for future SAS', async () => {
    const { isSasStillValid } = await callComposable(() => useAttachments())
    const future = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    expect(isSasStillValid(`?se=${encodeURIComponent(future)}&sv=2021`)).toBe(true)
  })

  it('uploadFile uses createAttachment URL without fetching a second SAS', async () => {
    const future = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const blobUrl = `https://registration.coolestprojects.localhost:8443/_blob/devstoreaccount1/container/abc.mp4?se=${encodeURIComponent(future)}&sv=2021`
    mockFetch.mockResolvedValue({ url: blobUrl })

    const { uploadFile } = await callComposable(() => useAttachments())
    const file = new File(['content'], 'file.mp4', { type: 'video/mp4' })
    const result = await uploadFile(file)

    expect(result.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/attachments', expect.any(Object))
    expect(mockFetch).toHaveBeenCalledWith(
      '/attachments/abc.mp4/poster',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(capturedBlobUrl).toBe(blobUrl)
    expect(capturedBlobUrl.match(/\?/g)).toHaveLength(1)
  })

  it('deleteAttachment returns true on success', async () => {
    mockFetch.mockResolvedValue(null)
    const { deleteAttachment } = await callComposable(() => useAttachments())
    await expect(deleteAttachment('blob-id.mp4')).resolves.toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      '/attachments/blob-id.mp4',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('deleteAttachment returns false on failure', async () => {
    mockFetch.mockRejectedValue(new Error('fail'))
    const { deleteAttachment } = await callComposable(() => useAttachments())
    await expect(deleteAttachment('blob-id.mp4')).resolves.toBe(false)
  })

  it('getValidSasForBlob caches SAS', async () => {
    const future = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    mockFetch.mockResolvedValue({ url: `https://blob.test/file?se=${encodeURIComponent(future)}&sv=2021` })
    const attachments = await callComposable(() => useAttachments())
    const url = 'https://blob.test/container/file.mp4'
    const sas1 = await attachments.getValidSasForBlob(url)
    const sas2 = await attachments.getValidSasForBlob(url)
    expect(sas1).toBe(sas2)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('maps API file validation failure to tooLarge', async () => {
    mockFetch.mockRejectedValue({
      data: { statusCode: 400, message: 'File validation failed' },
    })

    const { uploadFile } = await callComposable(() => useAttachments())
    const file = new File(['content'], 'file.mp4', { type: 'video/mp4' })
    const result = await uploadFile(file)

    expect(result).toEqual({
      ok: false,
      code: 'tooLarge',
      message: 'File validation failed',
    })
  })

  it('maps API attachment limit failure to tooMany', async () => {
    mockFetch.mockRejectedValue({
      data: { statusCode: 400, message: 'Maximum number of attachments reached' },
    })

    const { uploadFile } = await callComposable(() => useAttachments())
    const file = new File(['content'], 'file.mp4', { type: 'video/mp4' })
    const result = await uploadFile(file)

    expect(result).toEqual({
      ok: false,
      code: 'tooMany',
      message: 'Maximum number of attachments reached',
    })
  })
})
