import * as path from 'node:path';

const SAFE_FILENAME = /^[a-zA-Z0-9._-]+\.svg$/;

export function sanitizeFloorplanFilename(filename: string): string | null {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
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

export function getFloorplanDir(): string {
  const uploadRoot = process.env.UPLOAD_ROOT;
  if (!uploadRoot) {
    throw new Error('UPLOAD_ROOT environment variable is not set');
  }
  return path.join(uploadRoot, 'floorplans');
}
