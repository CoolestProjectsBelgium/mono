import { Attachment, AzureBlob } from '@coolestprojects/database';
import { AttachmentDto } from '../dto/attachment.dto';

export type AttachmentRowInput = Attachment & {
  azureBlob?: AzureBlob & { poster_blob_name?: string | null };
};

export type AttachmentBlobState = {
  exists: boolean;
  url: string | null;
  posterUrl?: string | null;
};

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic', 'heif']);

export function inferAttachmentType(filename: string): 'image' | 'movie' {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.has(ext) ? 'image' : 'movie';
}

export function mapAttachmentRowToDto(
  row: AttachmentRowInput,
  blobState: AttachmentBlobState,
): AttachmentDto | null {
  const blob = row.azureBlob;
  if (!blob) {
    return null;
  }

  return {
    id: blob.blob_name,
    name: row.name,
    filename: row.filename,
    url: blobState.url,
    size: blob.size,
    confirmed: row.confirmed || false,
    exists: blobState.exists,
    type: inferAttachmentType(row.filename),
    ...(blobState.posterUrl !== undefined ? { posterUrl: blobState.posterUrl } : {}),
  };
}
