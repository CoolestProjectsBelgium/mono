import * as path from 'node:path';

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)$/i;

export function sanitizePresentationFilename(filename: string): string | null {
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return null;
  }
  const base = path.basename(filename);
  if (!base || base !== filename) {
    return null;
  }
  if (!SAFE_FILENAME.test(base)) {
    return null;
  }
  return base;
}

/** `UPLOAD_ROOT/presentations/<eventId>/` — event-scoped by numeric id, own tree, no `Attachment` row. */
export function getPresentationDir(eventId: number): string {
  const uploadRoot = process.env.UPLOAD_ROOT;
  if (!uploadRoot) {
    throw new Error('UPLOAD_ROOT environment variable is not set');
  }
  return path.join(uploadRoot, 'presentations', String(eventId));
}

export function resolvePresentationFilePath(
  eventId: number,
  filename: string,
): string | null {
  const safe = sanitizePresentationFilename(filename);
  if (!safe) {
    return null;
  }
  return path.join(getPresentationDir(eventId), safe);
}

const SAFE_ASSET_FILENAME = /^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|svg|gif)$/i;

export function sanitizePresentationAssetFilename(
  filename: string,
): string | null {
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return null;
  }
  const base = path.basename(filename);
  if (!base || base !== filename) {
    return null;
  }
  if (!SAFE_ASSET_FILENAME.test(base)) {
    return null;
  }
  return base;
}

/**
 * `UPLOAD_ROOT/presentations/<eventId>/assets/` — logos and other static art
 * an admin uploads for reuse across slides, separate from a single slide's
 * own `imagePath` upload and the rendered slide PNGs that live one level up.
 */
export function getPresentationAssetsDir(eventId: number): string {
  return path.join(getPresentationDir(eventId), 'assets');
}

export function resolvePresentationAssetFilePath(
  eventId: number,
  filename: string,
): string | null {
  const safe = sanitizePresentationAssetFilename(filename);
  if (!safe) {
    return null;
  }
  return path.join(getPresentationAssetsDir(eventId), safe);
}
