import { describe, expect, it } from 'vitest'
import { getFileExtension, inferAttachmentMediaKind } from './attachment-media'

describe('attachment-media', () => {
  it('extracts file extension', () => {
    expect(getFileExtension('clip.mp4')).toBe('mp4')
    expect(getFileExtension('noext')).toBe('')
  })

  it('infers image kinds', () => {
    expect(inferAttachmentMediaKind('photo.png')).toBe('image')
    expect(inferAttachmentMediaKind('photo.heic')).toBe('image')
  })

  it('infers video kinds', () => {
    expect(inferAttachmentMediaKind('clip.mp4')).toBe('video')
    expect(inferAttachmentMediaKind('clip.mov')).toBe('video')
  })

  it('returns unknown for unsupported extensions', () => {
    expect(inferAttachmentMediaKind('doc.pdf')).toBe('unknown')
  })
})
