import {
  EmailTemplate,
  Event,
  Question,
  QuestionTranslation,
} from '@coolestprojects/database';
import {
  buildSeedEmailTemplates,
  type SeedEmailTemplateRow,
} from '../mailer/seed-email-templates';
import {
  QUESTION_TRANSLATION_COPY,
  SEED_QUESTION_NAMES,
  type SeedLanguage,
  type SeedQuestionName,
} from './seed-question-translations';

export const CORE_EMAIL_TEMPLATE_KEYS = [
  'registration',
  'welcomeOwner',
  'welcomeCoWorker',
  'waiting',
  'ask4Token',
  'emailExists',
] as const;

export type CoreEmailTemplateKey = (typeof CORE_EMAIL_TEMPLATE_KEYS)[number];

export interface SyncEventCopyResult {
  eventId: number;
  questionTranslationsUpdated: number;
  questionTranslationsCreated: number;
  emailTemplatesUpdated: number;
  emailTemplatesCreated: number;
}

export async function syncEventCopy(
  event: Event,
  questionModel: typeof Question,
  questionTranslationModel: typeof QuestionTranslation,
  emailTemplateModel: typeof EmailTemplate,
): Promise<SyncEventCopyResult> {
  const eventId = event.id;
  let questionTranslationsUpdated = 0;
  let questionTranslationsCreated = 0;
  let emailTemplatesUpdated = 0;
  let emailTemplatesCreated = 0;

  for (const questionName of SEED_QUESTION_NAMES) {
    const question = await questionModel.findOne({
      where: { eventId, name: questionName },
    });
    if (!question) {
      throw new Error(
        `Question "${questionName}" not found for event ${eventId}`,
      );
    }

    for (const language of ['en', 'nl', 'fr'] as SeedLanguage[]) {
      const copy = QUESTION_TRANSLATION_COPY[questionName][language];
      const existing = await questionTranslationModel.findOne({
        where: { eventId, questionId: question.id, language },
      });

      if (existing) {
        await existing.update(copy);
        questionTranslationsUpdated += 1;
      } else {
        await questionTranslationModel.create({
          eventId,
          questionId: question.id,
          language,
          ...copy,
        });
        questionTranslationsCreated += 1;
      }
    }
  }

  const coreTemplates = buildSeedEmailTemplates(eventId).filter((row) =>
    CORE_EMAIL_TEMPLATE_KEYS.includes(row.template as CoreEmailTemplateKey),
  );

  for (const row of coreTemplates) {
    const { created } = await upsertEmailTemplate(emailTemplateModel, row);
    if (created) {
      emailTemplatesCreated += 1;
    } else {
      emailTemplatesUpdated += 1;
    }
  }

  return {
    eventId,
    questionTranslationsUpdated,
    questionTranslationsCreated,
    emailTemplatesUpdated,
    emailTemplatesCreated,
  };
}

async function upsertEmailTemplate(
  emailTemplateModel: typeof EmailTemplate,
  row: SeedEmailTemplateRow,
): Promise<{ created: boolean }> {
  const existing = await emailTemplateModel.findOne({
    where: {
      eventId: row.eventId,
      template: row.template,
      language: row.language,
    },
  });

  if (existing) {
    await existing.update({
      subject: row.subject,
      contentPlain: row.contentPlain,
      contentRich: row.contentRich,
    });
    return { created: false };
  }

  await emailTemplateModel.create(
    row as unknown as Parameters<typeof emailTemplateModel.create>[0],
  );
  return { created: true };
}
