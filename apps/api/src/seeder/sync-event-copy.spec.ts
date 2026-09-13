import { Event, EmailTemplate, Question, QuestionTranslation } from '@coolestprojects/database';
import { buildSeedEmailTemplates } from '../mailer/seed-email-templates';
import {
  APPROVAL_QUESTION_NAME,
  CONTACT_QUESTION_NAME,
  PHOTO_QUESTION_NAME,
} from './seed-question-translations';
import {
  CORE_EMAIL_TEMPLATE_KEYS,
  syncEventCopy,
} from './sync-event-copy';

describe('syncEventCopy', () => {
  const event = { id: 9 } as Event;

  const questions = [
    { id: 1, name: PHOTO_QUESTION_NAME },
    { id: 2, name: CONTACT_QUESTION_NAME },
    { id: 3, name: APPROVAL_QUESTION_NAME },
  ];

  function makeQuestionModel(findResults: Record<string, Question | null>) {
    return {
      findOne: jest.fn(async ({ where }: { where: { name: string } }) => {
        if (Object.prototype.hasOwnProperty.call(findResults, where.name)) {
          return findResults[where.name];
        }
        const match = questions.find((q) => q.name === where.name);
        return (match as Question | undefined) ?? null;
      }),
    } as unknown as typeof Question;
  }

  function makeQuestionTranslationModel(
    existing: Array<{
      id: number;
      eventId: number;
      questionId: number;
      language: string;
      description?: string;
      positive?: string;
      negative?: string;
    }>,
  ) {
    const rows = [...existing];
    return {
      findOne: jest.fn(
        async ({
          where,
        }: {
          where: { eventId: number; questionId: number; language: string };
        }) => {
          const row = rows.find(
            (candidate) =>
              candidate.eventId === where.eventId &&
              candidate.questionId === where.questionId &&
              candidate.language === where.language,
          );
          if (!row) {
            return null;
          }
          return {
            ...row,
            update: jest.fn(async (values: Partial<typeof row>) => {
              Object.assign(row, values);
            }),
          };
        },
      ),
      create: jest.fn(async (values: typeof rows[number]) => {
        const row = { ...values, id: rows.length + 1 };
        rows.push(row);
        return row;
      }),
      _rows: rows,
    };
  }

  function makeEmailTemplateModel(
    existing: Array<{
      id: number;
      eventId: number;
      template: string;
      language: string;
      subject?: string;
      contentPlain?: string;
      contentRich?: string;
    }>,
  ) {
    const rows = [...existing];
    return {
      findOne: jest.fn(
        async ({
          where,
        }: {
          where: { eventId: number; template: string; language: string };
        }) => {
          const row = rows.find(
            (candidate) =>
              candidate.eventId === where.eventId &&
              candidate.template === where.template &&
              candidate.language === where.language,
          );
          if (!row) {
            return null;
          }
          return {
            ...row,
            update: jest.fn(async (values: Partial<typeof row>) => {
              Object.assign(row, values);
            }),
          };
        },
      ),
      create: jest.fn(async (values: typeof rows[number]) => {
        const row = { ...values, id: rows.length + 1 };
        rows.push(row);
        return row;
      }),
      _rows: rows,
    };
  }

  it('updates existing translations and creates missing ones', async () => {
    const translationModel = makeQuestionTranslationModel([
      { id: 10, eventId: 9, questionId: 1, language: 'en' },
    ]);
    const emailModel = makeEmailTemplateModel([]);

    const result = await syncEventCopy(
      event,
      makeQuestionModel({}),
      translationModel as unknown as typeof QuestionTranslation,
      emailModel as unknown as typeof EmailTemplate,
    );

    expect(result.questionTranslationsUpdated).toBe(1);
    expect(result.questionTranslationsCreated).toBe(8);
    expect(translationModel.create).toHaveBeenCalled();
  });

  it('throws when a required question name is missing', async () => {
    const questionModel = makeQuestionModel({
      [PHOTO_QUESTION_NAME]: null,
    });

    await expect(
      syncEventCopy(
        event,
        questionModel,
        makeQuestionTranslationModel([]) as unknown as typeof QuestionTranslation,
        makeEmailTemplateModel([]) as unknown as typeof EmailTemplate,
      ),
    ).rejects.toThrow(`Question "${PHOTO_QUESTION_NAME}" not found for event 9`);
  });

  it('only writes the six core email template keys', async () => {
    const emailModel = makeEmailTemplateModel([]);
    const translationModel = makeQuestionTranslationModel([]);

    await syncEventCopy(
      event,
      makeQuestionModel({}),
      translationModel as unknown as typeof QuestionTranslation,
      emailModel as unknown as typeof EmailTemplate,
    );

    const writtenTemplates = (emailModel as { _rows: Array<{ template: string }> })
      ._rows.map((row) => row.template);
    const uniqueTemplates = [...new Set(writtenTemplates)];

    expect(uniqueTemplates.sort()).toEqual([...CORE_EMAIL_TEMPLATE_KEYS].sort());
    expect(writtenTemplates).toHaveLength(CORE_EMAIL_TEMPLATE_KEYS.length * 3);

    const allSeedTemplates = buildSeedEmailTemplates(9).map((row) => row.template);
    expect(allSeedTemplates).toContain('dailyReminder');
    expect(writtenTemplates).not.toContain('dailyReminder');
  });
});
