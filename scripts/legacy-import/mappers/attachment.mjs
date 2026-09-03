import path from 'node:path';
import { copyTimestamps, eventIdOf, projectIdOf } from './helpers.mjs';

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export function sizeByAttachmentId(blobs = []) {
  const map = new Map();
  for (const blob of blobs) {
    const id = blob.AttachmentId ?? blob.attachmentId;
    if (id == null) continue;
    map.set(Number(id), Number(blob.size) || 0);
  }
  return map;
}

export function mapAttachment(row, { folderName, size = 0 } = {}) {
  const filename = row.filename || row.name || 'file';
  const projectId = projectIdOf(row);
  const ext = path.posix.extname(String(filename)).toLowerCase();
  return {
    id: row.id,
    eventId: eventIdOf(row),
    projectId,
    name: row.name,
    confirmed: Boolean(row.confirmed),
    internal: Boolean(row.internal),
    filepath: `${folderName}/project_${projectId}/${filename}`,
    mimetype: MIME_BY_EXT[ext] || 'application/octet-stream',
    size,
    thumbnailPath: '',
    bigThumbnailPath: '',
    ...copyTimestamps(row),
  };
}
