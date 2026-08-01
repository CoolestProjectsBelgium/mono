import type { AttachmentDto } from '~/types/api'

export const MAX_PROJECT_ATTACHMENTS = 10

/** Blob name used by DELETE /attachments/:name (same as AttachmentDto.id). */
export function getAttachmentBlobId(attachment: AttachmentDto): string {
  return attachment.id
}

export function isAttachmentLimitReached(count: number, max: number): boolean {
  return count >= max
}

export function resolveMaxAttachments(max: number | undefined): number {
  return max && max > 0 ? max : MAX_PROJECT_ATTACHMENTS
}