import { describe, expect, it } from 'vitest'
import { formatFileSize, isAllowedUploadMimeType, validateUploadFile } from '~/utils/validation/upload'

describe('validateUploadFile', () => {
  const maxUploadSize = 1024

  it('rejects files over the size limit', () => {
    const file = new File(['x'.repeat(maxUploadSize + 1)], 'big.mp4', { type: 'video/mp4' })
    expect(validateUploadFile(file, { maxUploadSize })).toEqual({ ok: false, code: 'tooLarge' })
  })

  it('rejects invalid mime types', () => {
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' })
    expect(validateUploadFile(file, { maxUploadSize })).toEqual({ ok: false, code: 'invalidType' })
  })

  it('accepts valid video files', () => {
    const file = new File(['video'], 'clip.mp4', { type: 'video/mp4' })
    expect(validateUploadFile(file, { maxUploadSize })).toEqual({ ok: true })
  })

  it('accepts valid image files', () => {
    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' })
    expect(validateUploadFile(file, { maxUploadSize })).toEqual({ ok: true })
  })
})

describe('isAllowedUploadMimeType', () => {
  it('allows video and image prefixes', () => {
    expect(isAllowedUploadMimeType('video/mp4')).toBe(true)
    expect(isAllowedUploadMimeType('image/png')).toBe(true)
    expect(isAllowedUploadMimeType('application/pdf')).toBe(false)
  })
})

describe('formatFileSize', () => {
  it('formats bytes and kilobytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(2048)).toBe('2 KB')
  })
})
