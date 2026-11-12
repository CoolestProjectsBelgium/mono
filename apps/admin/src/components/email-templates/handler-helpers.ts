export const EMAIL_TEMPLATE_RESOURCE_ID = 'EmailTemplates';

export const SUPPORTED_LANGUAGES = ['nl', 'en', 'fr'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface EmailTemplateRecord {
  id: number;
  template: string;
  language: string;
  subject: string;
  contentRich: string;
  contentPlain: string;
}

export interface SavePayload {
  template: string;
  language: string;
  subject: string;
  contentRich: string;
  contentPlain: string;
}

export type ContextRecordType = 'user' | 'registration';

const REGISTRATION_CONTEXT_TEMPLATES = new Set([
  'registration',
  'waiting',
  'delete',
  'activation',
  'notifyNewProjectOwner',
  'registrationReminder',
]);

export function getContextRecordType(template: string): ContextRecordType {
  return REGISTRATION_CONTEXT_TEMPLATES.has(template) ? 'registration' : 'user';
}

export function buildLoadKey(
  eventId: number,
  template: string,
  language: string,
): string {
  return `${eventId}:${template}:${language}`;
}

export function assertEventId(
  eventId: number | undefined,
): asserts eventId is number {
  if (!eventId) {
    throw new Error('No event selected for this admin account');
  }
}

/** Form values arrive as strings; anything that is not a primitive counts as empty. */
function asText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : '';
}

export function normalizeSavePayload(
  payload: Record<string, unknown>,
): SavePayload {
  const template = asText(payload.template).trim();
  const language = asText(payload.language).trim();
  const subject = asText(payload.subject);
  const contentRich = asText(payload.contentRich);
  const contentPlain = asText(payload.contentPlain);

  if (!template || !language) {
    throw new Error('Template and language are required');
  }

  if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return { template, language, subject, contentRich, contentPlain };
}

export function mapRecord(row: {
  id: number;
  template: string;
  language: string;
  subject: string;
  contentRich: string;
  contentPlain: string;
}): EmailTemplateRecord {
  return {
    id: row.id,
    template: row.template,
    language: row.language,
    subject: row.subject,
    contentRich: row.contentRich,
    contentPlain: row.contentPlain,
  };
}
