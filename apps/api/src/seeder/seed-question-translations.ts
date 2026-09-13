export const PHOTO_QUESTION_NAME = 'Agree to Photo';
export const CONTACT_QUESTION_NAME = 'Agree to Contact';
export const APPROVAL_QUESTION_NAME = 'Approved';

export const SEED_QUESTION_NAMES = [
  PHOTO_QUESTION_NAME,
  CONTACT_QUESTION_NAME,
  APPROVAL_QUESTION_NAME,
] as const;

export type SeedQuestionName = (typeof SEED_QUESTION_NAMES)[number];
export type SeedLanguage = 'en' | 'nl' | 'fr';

export interface QuestionTranslationCopy {
  description: string;
  positive: string;
  negative: string;
}

export const QUESTION_TRANSLATION_COPY: Record<
  SeedQuestionName,
  Record<SeedLanguage, QuestionTranslationCopy>
> = {
  [PHOTO_QUESTION_NAME]: {
    en: {
      positive: "Yes, that's no problem",
      negative:
        "No, don't use any images where the participant is recognizable",
      description:
        'May we take photos or videos where the participant is recognizable?',
    },
    nl: {
      positive: 'Ja, dat is geen probleem',
      negative: 'Nee, gebruik geen beeld waarop de deelnemer herkenbaar is',
      description:
        "Mogen we foto's of filmpjes maken waarop de deelnemer herkenbaar is?",
    },
    fr: {
      positive: 'Oui, pas de problème',
      negative:
        "Non, n'utilisez pas d'images où le ou la participant·e est reconnaissable",
      description:
        'Pouvons-nous prendre des photos ou vidéos où le ou la participant·e est reconnaissable ?',
    },
  },
  [CONTACT_QUESTION_NAME]: {
    en: {
      positive: 'Yes',
      negative: 'No',
      description: 'Can CoderDojo Belgium contact you for the next edition?',
    },
    nl: {
      positive: 'Ja',
      negative: 'Nee',
      description:
        'Mag CoderDojo Belgium je contacteren voor de volgende editie?',
    },
    fr: {
      positive: 'Oui',
      negative: 'Non',
      description:
        'CoderDojo Belgium peut-il te contacter pour la prochaine édition ?',
    },
  },
  [APPROVAL_QUESTION_NAME]: {
    en: {
      positive: 'Yes',
      negative: 'No',
      description: 'I have read the rules and I agree.',
    },
    nl: {
      positive: 'Ja',
      negative: 'Nee',
      description: 'Ik heb de regels gelezen en ga ermee akkoord.',
    },
    fr: {
      positive: 'Oui',
      negative: 'Non',
      description: "J'ai lu les règles et je les accepte.",
    },
  },
};

const LANGUAGES: SeedLanguage[] = ['en', 'nl', 'fr'];

export function buildQuestionTranslationRows(
  eventId: number,
  questionIds: Record<SeedQuestionName, number>,
): Array<{
  eventId: number;
  language: SeedLanguage;
  questionId: number;
  description: string;
  positive: string;
  negative: string;
}> {
  const rows: Array<{
    eventId: number;
    language: SeedLanguage;
    questionId: number;
    description: string;
    positive: string;
    negative: string;
  }> = [];

  for (const questionName of SEED_QUESTION_NAMES) {
    for (const language of LANGUAGES) {
      const copy = QUESTION_TRANSLATION_COPY[questionName][language];
      rows.push({
        eventId,
        language,
        questionId: questionIds[questionName],
        ...copy,
      });
    }
  }

  return rows;
}
