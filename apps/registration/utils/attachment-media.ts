export type AttachmentMediaKind = 'image' | 'video' | 'unknown'

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic', 'heif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm', '3gp', 'm4v'])

export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  if (parts.length < 2) {
    return ''
  }
  return parts[parts.length - 1].toLowerCase()
}

export function inferAttachmentMediaKind(filename: string): AttachmentMediaKind {
  const ext = getFileExtension(filename)
  if (IMAGE_EXTENSIONS.has(ext)) {
    return 'image'
  }
  if (VIDEO_EXTENSIONS.has(ext)) {
    return 'video'
  }
  return 'unknown'
}

export function isImageAttachment(filename: string): boolean {
  return inferAttachmentMediaKind(filename) === 'image'
}

export function isVideoAttachment(filename: string): boolean {
  return inferAttachmentMediaKind(filename) === 'video'
}
