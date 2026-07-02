import { describe, expect, it } from 'vitest'
import { getAttachmentBlobId } from './attachment'
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
