const thumbnailObjectUrlCache = new Map<string, string>()

export function buildAttachmentThumbnailPath(attachmentId: string): string {
  return `/projectinfo/attachments/${encodeURIComponent(attachmentId)}`
}

export async function fetchAttachmentThumbnailObjectUrl(
  apiBase: string,
  attachmentId: string,
): Promise<string | null> {
  const cached = thumbnailObjectUrlCache.get(attachmentId)
  if (cached) {
    return cached
  }

  const baseURL = apiBase.replace(/\/$/, '')
  const url = `${baseURL}${buildAttachmentThumbnailPath(attachmentId)}`

  try {
    const response = await fetch(url, { credentials: 'include' })
    if (!response.ok) {
      return null
    }

    const blob = await response.blob()
    const imageBlob = blob.type.startsWith('image/')
      ? blob
      : new Blob([blob], { type: 'image/webp' })
    const objectUrl = URL.createObjectURL(imageBlob)
    thumbnailObjectUrlCache.set(attachmentId, objectUrl)
    return objectUrl
  }
  catch {
    return null
  }
}

export function revokeAttachmentThumbnailObjectUrl(attachmentId: string): void {
  const objectUrl = thumbnailObjectUrlCache.get(attachmentId)
  if (!objectUrl) {
    return
  }
  URL.revokeObjectURL(objectUrl)
  thumbnailObjectUrlCache.delete(attachmentId)
}

export function clearAttachmentThumbnailCache(): void {
  for (const objectUrl of thumbnailObjectUrlCache.values()) {
    URL.revokeObjectURL(objectUrl)
  }
  thumbnailObjectUrlCache.clear()
}
