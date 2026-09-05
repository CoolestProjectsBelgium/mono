import {
  getCookieHeader,
  nestFetch,
  parseNestJson,
} from '../../api/nest-fetch.js';

export interface FloorplanListItem {
  filename: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface FloorplansOverview {
  floorplans: FloorplanListItem[];
  activeFilename: string | null;
}

export const Handler = async (request: any, _response: any, context: any): Promise<FloorplansOverview> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) {
    throw new Error('No event selected');
  }

  const payload = request.payload ?? {};
  const cookieHeader = getCookieHeader(request);

  if (request.method?.toLowerCase() === 'post') {
    if (payload.action === 'set-active') {
      const filename = encodeURIComponent(String(payload.filename ?? ''));
      const response = await nestFetch(`/admin/floorplans/${filename}/activate`, {
        method: 'POST',
        cookieHeader,
      });
      return parseNestJson<FloorplansOverview>(response);
    }

    if (payload.action === 'upload') {
      const response = await nestFetch('/admin/floorplans', {
        method: 'POST',
        cookieHeader,
        body: {
          svgContent: String(payload.svgContent ?? ''),
          originalName: String(payload.originalName ?? 'floorplan.svg'),
        },
      });
      return parseNestJson<FloorplansOverview>(response);
    }

    throw new Error('Unknown action');
  }

  const response = await nestFetch('/admin/floorplans', { cookieHeader });
  return parseNestJson<FloorplansOverview>(response);
};
