import { describe, expect, it, vi } from 'vitest'
import { classifyUploadFile } from './attachment-normalize'

describe('attachment-normalize', () => {
  it('classifies native image files', () => {
    expect(classifyUploadFile(new File(['x'], 'photo.png', { type: 'image/png' }))).toBe('native')
    expect(classifyUploadFile(new File(['x'], 'photo.jpg', { type: 'image/jpeg' }))).toBe('native')
  })

  it('classifies convertible images', () => {
    expect(classifyUploadFile(new File(['x'], 'photo.webp', { type: 'image/webp' }))).toBe('convertible-image')
    expect(classifyUploadFile(new File(['x'], 'photo.heic', { type: 'image/heic' }))).toBe('convertible-image')
  })

  it('rejects video files', () => {
    expect(classifyUploadFile(new File(['x'], 'clip.mp4', { type: 'video/mp4' }))).toBe('rejected')
    expect(classifyUploadFile(new File(['x'], 'clip.mov', { type: 'video/quicktime' }))).toBe('rejected')
  })

  it('rejects non-media files', () => {
    expect(classifyUploadFile(new File(['x'], 'doc.pdf', { type: 'application/pdf' }))).toBe('rejected')
  })

  it('normalizes webp via canvas', async () => {
    const drawImage = vi.fn()
    const toBlob = vi.fn((callback: (blob: Blob | null) => void) => {
      callback(new Blob(['jpeg'], { type: 'image/jpeg' }))
    })
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({
      width: 10,
      height: 10,
      close: vi.fn(),
    })))
    vi.spyOn(document, 'createElement').mockReturnValue({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage }),
      toBlob,
    } as unknown as HTMLCanvasElement)

    const { normalizeUploadFile } = await import('./attachment-normalize')
    const result = await normalizeUploadFile(new File(['x'], 'photo.webp', { type: 'image/webp' }))
    expect(result.filename).toBe('photo.jpg')
  })
})
