import { NestApiClient } from '../../api/nest-api-client.js';

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
      return (
        await api.post<PresentationAssetsOverview>(
          '/admin/presentation-assets',
          {
            imageContentBase64: String(payload.imageContentBase64 ?? ''),
            originalName: String(payload.originalName ?? 'asset.png'),
          },
        )
      ).data;
    }

    throw new Error('Unknown action');
  }

  return (
    await api.get<PresentationAssetsOverview>('/admin/presentation-assets')
  ).data;
};
