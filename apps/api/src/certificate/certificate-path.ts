import * as path from 'node:path';

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.pdf$/i;

export function sanitizeCertificateFilename(filename: string): string | null {
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

/** `UPLOAD_ROOT/certificates/<eventId>/` — event-scoped by numeric id, own tree, no `Attachment` row. */
export function getCertificateDir(eventId: number): string {
  const uploadRoot = process.env.UPLOAD_ROOT;
  if (!uploadRoot) {
    throw new Error('UPLOAD_ROOT environment variable is not set');
  }
  return path.join(uploadRoot, 'certificates', String(eventId));
}

export function resolveCertificateFilePath(
  eventId: number,
  filename: string,
): string | null {
  const safe = sanitizeCertificateFilename(filename);
  if (!safe) {
    return null;
  }
  return path.join(getCertificateDir(eventId), safe);
}

const SAFE_ASSET_FILENAME = /^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|svg|gif)$/i;

export function sanitizeCertificateAssetFilename(
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
 * `UPLOAD_ROOT/certificates/<eventId>/assets/` — logos/seals/signatures an
 * admin uploads for reuse across every certificate, separate from the
 * rendered per-participant PDFs that live one level up.
 */
export function getCertificateAssetsDir(eventId: number): string {
  return path.join(getCertificateDir(eventId), 'assets');
}

export function resolveCertificateAssetFilePath(
  eventId: number,
  filename: string,
): string | null {
  const safe = sanitizeCertificateAssetFilename(filename);
  if (!safe) {
    return null;
  }
  return path.join(getCertificateAssetsDir(eventId), safe);
}
