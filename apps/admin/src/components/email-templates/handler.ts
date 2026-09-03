import { EmailTemplate as EmailTemplateModel } from '@coolestprojects/database';
import { sequelize } from '../../database.js';
import {
  assertEventId,
  assertNotJudge,
  mapRecord,
  normalizeSavePayload,
  SUPPORTED_LANGUAGES,
  type EmailTemplateRecord,
} from './handler-helpers.js';
import { renderPreview, type PreviewResult } from './render-preview.js';

const EmailTemplate = sequelize.models.EmailTemplate as typeof EmailTemplateModel;

export interface EmailTemplatesMeta {
  templates: string[];
  languages: readonly string[];
}

export interface EmailTemplatesPageData extends EmailTemplatesMeta {
  record: EmailTemplateRecord | null;
  preview?: PreviewResult;
}

async function listTemplates(eventId: number): Promise<string[]> {
  const rows = await EmailTemplate.findAll({
    where: { eventId },
    attributes: ['template'],
    group: ['template'],
    order: [['template', 'ASC']],
  });

  return rows.map((row) => row.template);
}

async function loadRecord(
  eventId: number,
  template: string,
  language: string,
): Promise<EmailTemplateRecord | null> {
  const row = await EmailTemplate.findOne({
    where: { eventId, template, language },
  });

  return row ? mapRecordFromRow(row) : null;
}

function mapRecordFromRow(row: EmailTemplateModel): EmailTemplateRecord {
  return mapRecord({
    id: row.id as number,
    template: row.template,
    language: row.language,
    subject: row.subject,
    contentRich: row.contentRich,
    contentPlain: row.contentPlain,
  });
}

export const Handler = async (
  request: any,
  _response: any,
  context: any,
): Promise<EmailTemplatesPageData> => {
  assertNotJudge(context.currentAdmin?.role);
  const eventId = context.currentAdmin?.eventId;
  assertEventId(eventId);

  const payload = request.payload ?? {};
  const templates = await listTemplates(eventId);

  if (request.method?.toLowerCase() === 'post') {
    const action = String(payload.action ?? '');

    if (action === 'load') {
      const template = String(payload.template ?? '');
      const language = String(payload.language ?? '');
      const record = await loadRecord(eventId, template, language);

      if (!record) {
        throw new Error(
          `No email template found for ${template} (${language}) in this event`,
        );
      }

      return { templates, languages: SUPPORTED_LANGUAGES, record };
    }

    if (action === 'preview') {
      const savePayload = normalizeSavePayload(payload);
      const guardianEmail = payload.guardianEmail === true
        || payload.guardianEmail === 'true'
        || payload.guardianEmail === 1;

      const preview = renderPreview({
        subject: savePayload.subject,
        contentRich: savePayload.contentRich,
        contentPlain: savePayload.contentPlain,
        guardianEmail,
      });

      return {
        templates,
        languages: SUPPORTED_LANGUAGES,
        record: await loadRecord(eventId, savePayload.template, savePayload.language),
        preview,
      };
    }

    throw new Error(`Unknown action: ${action}`);
  }

  const defaultTemplate = templates[0] ?? '';
  const record = defaultTemplate
    ? await loadRecord(eventId, defaultTemplate, 'nl')
    : null;

  return {
    templates,
    languages: SUPPORTED_LANGUAGES,
    record,
  };
};
