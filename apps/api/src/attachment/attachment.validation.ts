export const CANONICAL_STORAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'mp4'] as const;

const IMAGE_MIME_PREFIX = 'image/';
const VIDEO_MIME_PREFIX = 'video/';

export function getFilenameExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length < 2) {
    return '';
  }
  return parts[parts.length - 1].toLowerCase();
}

export function isCanonicalStorageFilename(filename: string): boolean {
  return CANONICAL_STORAGE_EXTENSIONS.includes(
    getFilenameExtension(filename) as (typeof CANONICAL_STORAGE_EXTENSIONS)[number],
  );
}

export function isAllowedUploadMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith(IMAGE_MIME_PREFIX) || mimeType.startsWith(VIDEO_MIME_PREFIX)
  );
}

export function assertAllowedUpload(dto: {
  filename: string;
  name: string;
}): void {
  if (!dto.name?.trim()) {
    throw new Error('Name is required');
  }
  if (dto.name.trim().length > 50) {
    throw new Error('Name is too long');
  }
  if (!isCanonicalStorageFilename(dto.filename)) {
    throw new Error('File validation failed');
  }
}
