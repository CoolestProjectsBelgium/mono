import { PresentationSlide as PresentationSlideModel } from '@coolestprojects/database';
import { sequelize } from '../../database.js';
import { NestApiClient } from '../../api/nest-api-client.js';

const PresentationSlide = sequelize.models.PresentationSlide as typeof PresentationSlideModel;

export interface PresentationSlideConfig {
  id: number;
  title: string;
  order: number;
  time: number;
  dataSource: string;
  cardinality: string;
  body: string;
  imagePath: string | null;
}

export interface DeckSlideSummary {
  key: string;
  order: number;
  time: number;
  hash: string;
  generatedAt: string | null;
  imageUrl: string;
}

export interface ProjectOption {
  id: number;
  name: string;
}

export interface PresentationPageData {
  configs: PresentationSlideConfig[];
  slides: DeckSlideSummary[];
  deckHash: string;
  projectOptions?: ProjectOption[];
  previewImageBase64?: string;
}

function getApiBaseUrl(): string {
  return process.env.API_BASE_URL!.replace(/\/$/, '');
}

function buildSlideImageUrl(key: string, hash: string): string {
  return `${getApiBaseUrl()}/admin/presentation-slides/preview/${encodeURIComponent(key)}/image?v=${encodeURIComponent(hash)}`;
}

async function listConfigs(eventId: number): Promise<PresentationSlideConfig[]> {
  const rows = await PresentationSlide.findAll({
    where: { eventId },
    order: [['order', 'ASC'], ['id', 'ASC']],
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    order: row.order,
    time: row.time,
    dataSource: row.dataSource,
    cardinality: row.cardinality,
    body: row.body,
    imagePath: row.imagePath,
  }));
}

async function loadDeck(
  api: NestApiClient,
): Promise<{ slides: DeckSlideSummary[]; deckHash: string }> {
  const response = await api.get<{
    slides: { key: string; order: number; time: number; hash: string; generatedAt: string | null }[];
    hash: string;
  }>('/admin/presentation-slides/preview');

  const slides = response.data.slides.map((slide) => ({
    ...slide,
    imageUrl: buildSlideImageUrl(slide.key, slide.hash),
  }));

  return { slides, deckHash: response.data.hash };
}

export const Handler = async (
  request: any,
  _response: any,
  context: any,
): Promise<PresentationPageData> => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) {
    throw new Error('No event selected');
  }

  const configs = await listConfigs(eventId);
  const api = await NestApiClient.fromExpressRequest(request);

  if (request.method?.toLowerCase() === 'post') {
    const payload = request.payload ?? {};
    const action = String(payload.action ?? '');

    if (action === 'load-projects') {
      const response = await api.get<ProjectOption[]>('/admin/presentation-slides/preview/projects');
      const { slides, deckHash } = await loadDeck(api);
      return { configs, slides, deckHash, projectOptions: response.data };
    }

    if (action === 'preview') {
      const slideId = Number(payload.slideId);
      if (!Number.isInteger(slideId)) {
        throw new Error('A slide must be selected');
      }
      const body = String(payload.body ?? '');
      const projectId = payload.projectId ? Number(payload.projectId) : undefined;

      const response = await api.post<{ imageBase64: string }>('/admin/presentation-slides/preview/draft', {
        slideId,
        body,
        projectId,
      });
      const { slides, deckHash } = await loadDeck(api);
      return { configs, slides, deckHash, previewImageBase64: response.data.imageBase64 };
    }

    throw new Error(`Unknown action: ${action}`);
  }

  const { slides, deckHash } = await loadDeck(api);
  return { configs, slides, deckHash };
};
