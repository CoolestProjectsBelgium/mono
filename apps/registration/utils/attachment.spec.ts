import { describe, expect, it } from 'vitest'
import { getAttachmentBlobId, isAttachmentLimitReached, resolveMaxAttachments } from './attachment'
import type { AttachmentDto } from '~/types/api'

describe('getAttachmentBlobId', () => {
  it('returns attachment id as blob name', () => {
    const attachment: AttachmentDto = {
      id: 'uuid.mp4',
      name: 'clip',
      filename: 'clip.mp4',
      size: 1,
      confirmed: false,
      exists: true,
      type: 'movie',
    }
    expect(getAttachmentBlobId(attachment)).toBe('uuid.mp4')
  })
})

describe('isAttachmentLimitReached', () => {
  it('returns false below the limit', () => {
    expect(isAttachmentLimitReached(9, 10)).toBe(false)
  })

  it('returns true at the limit', () => {
    expect(isAttachmentLimitReached(10, 10)).toBe(true)
  })
})

describe('resolveMaxAttachments', () => {
  it('falls back to the default when settings omit maxAttachments', () => {
    expect(resolveMaxAttachments(undefined)).toBe(10)
  })
})
