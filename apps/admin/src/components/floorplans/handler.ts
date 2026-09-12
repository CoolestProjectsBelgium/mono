import { createReadStream } from 'node:fs';
import FormData from 'form-data';
import { NestApiClient } from '../../api/nest-api-client.js';

interface FormidableFile {
  path: string;
  name: string | null;
  type: string | null;
}

export interface FloorplanListItem {
  filename: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface FloorplansOverview {
  floorplans: FloorplanListItem[];
  activeFilename: string | null;
}

export const Handler = async (
  request: any,
  _response: any,
  context: any,
): Promise<FloorplansOverview> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) {
    throw new Error('No event selected');
  }

  const api = await NestApiClient.fromExpressRequest(request);
  const payload = request.payload ?? {};

  if (request.method?.toLowerCase() === 'post') {
    if (payload.action === 'set-active') {
      const filename = encodeURIComponent(String(payload.filename ?? ''));
      return (
        await api.post<FloorplansOverview>(
          `/admin/floorplans/${filename}/activate`,
        )
      ).data;
    }

    if (payload.action === 'delete') {
      const filename = encodeURIComponent(String(payload.filename ?? ''));
      return (
        await api.delete<FloorplansOverview>(`/admin/floorplans/${filename}`)
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
        filename: file.name || 'floorplan.svg',
        contentType: file.type || 'image/svg+xml',
      });

      return (await api.postForm<FloorplansOverview>('/admin/floorplans', form))
        .data;
    }

    throw new Error('Unknown action');
  }

  return (await api.get<FloorplansOverview>('/admin/floorplans')).data;
};
