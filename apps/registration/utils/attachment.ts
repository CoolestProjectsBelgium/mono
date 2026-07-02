import type { AttachmentDto } from '~/types/api'

/** Blob name used by DELETE /attachments/:name (same as AttachmentDto.id). */
export function getAttachmentBlobId(attachment: AttachmentDto): string {
  return attachment.id
}
