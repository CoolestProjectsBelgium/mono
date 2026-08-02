import { classifyUploadFile } from '../attachment-normalize'

export type UploadValidationCode = 'tooLarge' | 'invalidType'

export type UploadValidationResult =
  | { ok: true }
  | { ok: false, code: UploadValidationCode }

export function isAllowedUploadMimeType(type: string): boolean {
  return type.startsWith('video/') || type.startsWith('image/')
}

export function validateUploadFile(
  file: File,
  options: { maxUploadSize: number },
): UploadValidationResult {
  if (classifyUploadFile(file) === 'rejected') {
    return { ok: false, code: 'invalidType' }
  }
  if (!isAllowedUploadMimeType(file.type)) {
    return { ok: false, code: 'invalidType' }
  }
  if (file.size > options.maxUploadSize) {
    return { ok: false, code: 'tooLarge' }
  }
  return { ok: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
