export type UploadValidationCode = 'tooLarge' | 'invalidType'

export type UploadValidationResult =
  | { ok: true }
  | { ok: false, code: UploadValidationCode }

const ALLOWED_TYPE_PREFIXES = ['video/', 'image/']

export function isAllowedUploadMimeType(type: string): boolean {
  return ALLOWED_TYPE_PREFIXES.some(prefix => type.startsWith(prefix))
}

export function validateUploadFile(
  file: File,
  options: { maxUploadSize: number },
): UploadValidationResult {
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
