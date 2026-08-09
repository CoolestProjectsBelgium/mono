import { describe, expect, it } from 'vitest'
import { validateUploadFile } from './upload'

describe('upload validation', () => {
  it('rejects pdf files', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    expect(validateUploadFile(file, { maxUploadSize: 1000 })).toEqual({
      ok: false,
      code: 'invalidType',
    })
  })

  it('rejects video files', () => {
    const file = new File(['x'], 'clip.mp4', { type: 'video/mp4' })
    expect(validateUploadFile(file, { maxUploadSize: 1000 })).toEqual({
      ok: false,
      code: 'invalidType',
    })
  })

  it('accepts png files', () => {
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    expect(validateUploadFile(file, { maxUploadSize: 1000 })).toEqual({ ok: true })
  })

  it('accepts convertible heic files', () => {
    const file = new File(['x'], 'photo.heic', { type: 'image/heic' })
    expect(validateUploadFile(file, { maxUploadSize: 1000 })).toEqual({ ok: true })
  })
})
