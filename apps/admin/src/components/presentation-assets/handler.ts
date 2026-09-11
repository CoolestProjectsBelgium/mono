import { createReadStream } from 'node:fs';
import FormData from 'form-data';
import { NestApiClient } from '../../api/nest-api-client.js';

interface FormidableFile {
  path: string;
  name: string | null;
  type: string | null;
}

export interface PresentationAssetListItem {
  filename: string;
  uploadedAt: string;
}

export interface PresentationAssetsOverview {
  assets: PresentationAssetListItem[];
}

export const Handler = async (
  request: any,
  _response: any,
  context: any,
): Promise<PresentationAssetsOverview> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) {
    throw new Error('No event selected');
  }

  const api = await NestApiClient.fromExpressRequest(request);
  const method = request.method?.toLowerCase();
  const payload = request.payload ?? {};

  if (method === 'post') {
    if (payload.action === 'delete') {
      const filename = encodeURIComponent(String(payload.filename ?? ''));
      return (
        await api.delete<PresentationAssetsOverview>(
          `/admin/presentation-assets/${filename}`,
        )
      ).data;
    }

    if (payload.action === 'upload') {
      // AdminJS's own router already parses multipart bodies for every
      // page-handler action via express-formidable (see buildAuthenticatedRouter
      // in index.ts) — `payload.file` is the uploaded file, spooled to a temp
      // path on disk. Re-encoded once here into a real multipart request so
      // it reaches Nest's `FileInterceptor` route exactly like any other
      // upload in this codebase.
      const file = payload.file as FormidableFile | undefined;
      if (!file?.path) {
        throw new Error('No file uploaded');
      }

      const form = new FormData();
      form.append('file', createReadStream(file.path), {
        filename: file.name || 'asset.png',
        contentType: file.type || 'image/png',
      });

      return (
        await api.postForm<PresentationAssetsOverview>(
          '/admin/presentation-assets',
          form,
        )
      ).data;
    }

    throw new Error('Unknown action');
  }

  return (
    await api.get<PresentationAssetsOverview>('/admin/presentation-assets')
  ).data;
};
