import {
  APPROVAL_QUESTION_NAME,
  CONTACT_QUESTION_NAME,
  PHOTO_QUESTION_NAME,
  QUESTION_TRANSLATION_COPY,
} from './seed-question-translations';

describe('QUESTION_TRANSLATION_COPY', () => {
  it('uses recognizable wording for EN photo consent', () => {
    expect(QUESTION_TRANSLATION_COPY[PHOTO_QUESTION_NAME].en.description).toContain(
      'recognizable',
    );
    expect(QUESTION_TRANSLATION_COPY[PHOTO_QUESTION_NAME].en.negative).toContain(
      'recognizable',
    );
  });

  it('uses Oui for FR contact positive answer', () => {
    expect(QUESTION_TRANSLATION_COPY[CONTACT_QUESTION_NAME].fr.positive).toBe(
      'Oui',
    );
  });

  it('includes rules wording in approval descriptions', () => {
    expect(QUESTION_TRANSLATION_COPY[APPROVAL_QUESTION_NAME].en.description).toContain(
      'rules',
    );
    expect(QUESTION_TRANSLATION_COPY[APPROVAL_QUESTION_NAME].nl.description).toContain(
      'regels',
    );
    expect(QUESTION_TRANSLATION_COPY[APPROVAL_QUESTION_NAME].fr.description).toContain(
      'règles',
    );
  });
});
