import { NestApiClient } from '../../api/nest-api-client.js';
import type { AdminPageContext, AdminPageRequest } from '../../admin-types.js';

interface EventguideProjectsResponse {
  projects: { id: number }[];
}

export interface ArchivingPageData {
  eventId: number;
  projectCount: number;
}

export const Handler = async (
  request: AdminPageRequest,
  _response: unknown,
  context: AdminPageContext,
): Promise<ArchivingPageData> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) {
    throw new Error('No event selected');
  }

  const api = await NestApiClient.fromExpressRequest(request);
  const response = await api.get<EventguideProjectsResponse>(
    `/eventguide/events/${eventId}/projects`,
  );

  return { eventId, projectCount: response.data.projects.length };
};
