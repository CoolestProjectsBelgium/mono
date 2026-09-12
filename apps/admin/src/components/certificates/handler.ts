import {
  Award as AwardModel,
  Certificate as CertificateModel,
  CertificateTemplate as CertificateTemplateModel,
  Project as ProjectModel,
  VoteCategory as VoteCategoryModel,
} from '@coolestprojects/database';
import { createReadStream } from 'node:fs';
import FormData from 'form-data';
import { sequelize } from '../../database.js';
import { NestApiClient } from '../../api/nest-api-client.js';

const Certificate = sequelize.models.Certificate as typeof CertificateModel;
const CertificateTemplate = sequelize.models
  .CertificateTemplate as typeof CertificateTemplateModel;
const Award = sequelize.models.Award as typeof AwardModel;
const Project = sequelize.models.Project as typeof ProjectModel;
const VoteCategory = sequelize.models.VoteCategory as typeof VoteCategoryModel;

export const SUPPORTED_LANGUAGES = ['nl', 'fr', 'en'] as const;

interface FormidableFile {
  path: string;
  name: string | null;
  type: string | null;
}

export interface CertificateProjectRecord {
  certificateId: number | null;
  projectId: number;
  projectName: string;
  text: string;
  awardText: string | null;
  awardWon: boolean;
  awardCategoryName: string | null;
  isManual: boolean;
}

export interface CertificateTemplateRecord {
  id: number;
  language: string;
  bodyHtml: string;
}

export interface CertificateAssetListItem {
  filename: string;
  uploadedAt: string;
}

export interface CertificatesPageData {
  languages: readonly string[];
  projects: CertificateProjectRecord[];
  templates: CertificateTemplateRecord[];
}

function assertEventId(eventId: number | undefined): asserts eventId is number {
  if (!eventId) {
    throw new Error('No event selected for this admin account');
  }
}

/**
 * Seeds a `Certificate` row (empty text) for every project's `Award` that
 * doesn't have one yet — never overwrites an existing row, whether it was
 * seeded before or hand-edited since. Safe to call on every page load.
 */
async function syncCertificatesFromAwards(eventId: number): Promise<void> {
  const awards = await Award.findAll({ where: { eventId } });
  for (const award of awards) {
    await Certificate.findOrCreate({
      where: { eventId, projectId: award.projectId },
      defaults: {
        eventId,
        projectId: award.projectId,
        text: award.text?.toString() ?? '',
      },
    });
  }
}

async function loadProjectRecords(
  eventId: number,
): Promise<CertificateProjectRecord[]> {
  const awards = await Award.findAll({
    where: { eventId },
    include: [Project, VoteCategory],
  });
  const certificates = await Certificate.findAll({ where: { eventId } });
  const certificateByProject = new Map(
    certificates.map((certificate) => [certificate.projectId, certificate]),
  );

  return awards
    .map((award) => {
      const certificate = certificateByProject.get(award.projectId);
      const awardText = award.text?.toString() ?? null;
      return {
        certificateId: (certificate?.id as number | undefined) ?? null,
        projectId: award.projectId,
        projectName: award.project?.name ?? `Project #${award.projectId}`,
        text: certificate?.text ?? awardText ?? '',
        awardText,
        awardWon: Boolean(award.categoryId),
        awardCategoryName: award.category?.name ?? null,
        isManual: Boolean(certificate && certificate.text !== awardText),
      };
    })
    .sort((left, right) => left.projectName.localeCompare(right.projectName));
}

async function loadTemplates(
  eventId: number,
): Promise<CertificateTemplateRecord[]> {
  const templates = await CertificateTemplate.findAll({ where: { eventId } });
  return templates.map((template) => ({
    id: template.id as number,
    language: template.language,
    bodyHtml: template.bodyHtml,
  }));
}

export const Handler = async (
  request: any,
  _response: any,
  context: any,
): Promise<unknown> => {
  const eventId = context.currentAdmin?.eventId;
  assertEventId(eventId);

  const payload = request.payload ?? {};
  const method = request.method?.toLowerCase();

  if (method === 'post') {
    const action = String(payload.action ?? '');

    if (action === 'sync-from-awards') {
      await syncCertificatesFromAwards(eventId);
      return {
        languages: SUPPORTED_LANGUAGES,
        projects: await loadProjectRecords(eventId),
        templates: await loadTemplates(eventId),
      };
    }

    if (action === 'reset-project-text') {
      const projectId = Number(payload.projectId);
      const award = await Award.findOne({ where: { eventId, projectId } });
      if (award) {
        await Certificate.update(
          { text: award.text?.toString() ?? '' },
          { where: { eventId, projectId } },
        );
      }
      return {
        languages: SUPPORTED_LANGUAGES,
        projects: await loadProjectRecords(eventId),
        templates: await loadTemplates(eventId),
      };
    }

    if (action === 'status') {
      const api = await NestApiClient.fromExpressRequest(request);
      return (await api.get('/admin/certificates/status')).data;
    }

    if (action === 'preview') {
      const api = await NestApiClient.fromExpressRequest(request);
      return (
        await api.post('/admin/certificates/preview', {
          projectId: Number(payload.projectId),
          userId: Number(payload.userId),
          bodyHtml: String(payload.bodyHtml ?? ''),
          text: String(payload.text ?? ''),
        })
      ).data;
    }

    if (action === 'list-assets') {
      const api = await NestApiClient.fromExpressRequest(request);
      return (await api.get('/admin/certificates/assets')).data;
    }

    if (action === 'delete-asset') {
      const api = await NestApiClient.fromExpressRequest(request);
      const filename = encodeURIComponent(String(payload.filename ?? ''));
      return (
        await api.delete(`/admin/certificates/assets/${filename}`)
      ).data;
    }

    if (action === 'upload-asset') {
      // AdminJS's own router already parses multipart bodies for every
      // page-handler action via express-formidable — `payload.file` is the
      // uploaded file, spooled to a temp path on disk. Re-encoded once here
      // into a real multipart request so it reaches Nest's `FileInterceptor`
      // route, exactly like `presentation-assets/handler.ts` does.
      const file = payload.file as FormidableFile | undefined;
      if (!file?.path) {
        throw new Error('No file uploaded');
      }

      const form = new FormData();
      form.append('file', createReadStream(file.path), {
        filename: file.name || 'asset.png',
        contentType: file.type || 'image/png',
      });

      const api = await NestApiClient.fromExpressRequest(request);
      return (
        await api.postForm('/admin/certificates/assets', form)
      ).data;
    }

    throw new Error(`Unknown action: ${action}`);
  }

  await syncCertificatesFromAwards(eventId);

  return {
    languages: SUPPORTED_LANGUAGES,
    projects: await loadProjectRecords(eventId),
    templates: await loadTemplates(eventId),
  };
};
