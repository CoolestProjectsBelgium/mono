import {
  EmailTemplate as EmailTemplateModel,
  Registration as RegistrationModel,
  User as UserModel,
} from '@coolestprojects/database';
import { sequelize } from '../../database.js';
import { NestApiClient } from '../../api/nest-api-client.js';
import {
  assertEventId,
  mapRecord,
  normalizeSavePayload,
  SUPPORTED_LANGUAGES,
  getContextRecordType,
  type ContextRecordType,
  type EmailTemplateRecord,
} from './handler-helpers.js';
import { renderPreview, type PreviewResult } from './render-preview.js';

const EmailTemplate = sequelize.models
  .EmailTemplate as typeof EmailTemplateModel;
const Registration = sequelize.models.Registration as typeof RegistrationModel;
const User = sequelize.models.User as typeof UserModel;

export interface EmailTemplatesMeta {
  templates: string[];
  languages: readonly string[];
}

export interface EmailTemplatesPageData extends EmailTemplatesMeta {
  record: EmailTemplateRecord | null;
  preview?: PreviewResult;
}

export interface ContextRecordOption {
  value: string;
  label: string;
}

export interface ContextRecordsPageData extends EmailTemplatesPageData {
  contextRecordType: ContextRecordType;
  records: ContextRecordOption[];
  context?: Record<string, unknown>;
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

function recordLabel(record: {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}): string {
  const name = [record.firstname, record.lastname].filter(Boolean).join(' ');
  return `${name || 'Unnamed'} (#${record.id})${record.email ? ` - ${record.email}` : ''}`;
}

async function listContextRecords(
  eventId: number,
  recordType: ContextRecordType,
): Promise<ContextRecordOption[]> {
  const Model = (
    recordType === 'registration' ? Registration : User
  ) as typeof UserModel;
  const rows = await Model.findAll({
    where: { eventId },
    attributes: ['id', 'firstname', 'lastname', 'email'],
    order: [
      ['lastname', 'ASC'],
      ['firstname', 'ASC'],
      ['id', 'ASC'],
    ],
  });

  return rows.map((row) => ({
    value: String(row.id),
    label: recordLabel(
      row as unknown as {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
      },
    ),
  }));
}

/**
 * Fetches the mail-rendering context from the API — the same
 * `buildMailContext` a real send uses, with a placeholder token instead of a
 * real JWT. Keeps context shape defined in exactly one place.
 */
async function fetchMailContext(
  request: any,
  recordType?: ContextRecordType,
  recordId?: number,
): Promise<Record<string, unknown>> {
  const api = await NestApiClient.fromExpressRequest(request);
  const response = await api.post<Record<string, unknown>>(
    '/admin/mail-templates/context',
    {
      recordType,
      recordId,
    },
  );
  return response.data;
}

export const Handler = async (
  request: any,
  _response: any,
  context: any,
): Promise<EmailTemplatesPageData | ContextRecordsPageData> => {
  const eventId = context.currentAdmin?.eventId;
  assertEventId(eventId);

  const payload = request.payload ?? {};
  const templates = await listTemplates(eventId);

  if (request.method?.toLowerCase() === 'post') {
    const action = String(payload.action ?? '');

    if (action === 'context-options') {
      const template = String(payload.template ?? '');
      const contextRecordType = getContextRecordType(template);
      return {
        templates,
        languages: SUPPORTED_LANGUAGES,
        record: null,
        contextRecordType,
        records: await listContextRecords(eventId, contextRecordType),
      };
    }

    if (action === 'load-context') {
      const contextRecordType = String(
        payload.recordType ?? '',
      ) as ContextRecordType;
      const recordId = Number(payload.recordId);
      if (
        !['user', 'registration'].includes(contextRecordType) ||
        !Number.isInteger(recordId)
      ) {
        throw new Error('A valid context record is required');
      }

      return {
        templates,
        languages: SUPPORTED_LANGUAGES,
        record: null,
        contextRecordType,
        records: [],
        context: await fetchMailContext(request, contextRecordType, recordId),
      };
    }

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
      let context: Record<string, unknown>;

      if (String(payload.contextJson ?? '').trim()) {
        try {
          const parsed = JSON.parse(String(payload.contextJson));
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Context must be a JSON object');
          }
          context = parsed as Record<string, unknown>;
        } catch (error) {
          throw new Error(
            `Invalid context JSON: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      } else {
        context = await fetchMailContext(
          request,
          getContextRecordType(savePayload.template),
        );
      }

      const preview = renderPreview({
        subject: savePayload.subject,
        contentRich: savePayload.contentRich,
        contentPlain: savePayload.contentPlain,
        context,
      });

      return {
        templates,
        languages: SUPPORTED_LANGUAGES,
        record: await loadRecord(
          eventId,
          savePayload.template,
          savePayload.language,
        ),
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
