import { NestApiClient } from '../../api/nest-api-client.js';

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

    if (payload.action === 'upload') {
      return (
        await api.post<FloorplansOverview>('/admin/floorplans', {
          svgContent: String(payload.svgContent ?? ''),
          originalName: String(payload.originalName ?? 'floorplan.svg'),
        })
      ).data;
    }

    throw new Error('Unknown action');
  }

  return (await api.get<FloorplansOverview>('/admin/floorplans')).data;
};
