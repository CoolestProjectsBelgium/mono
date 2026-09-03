import { copyTimestamps, eventIdOf } from './helpers.mjs';

export function mapQuestion(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    name: row.name,
    mandatory: row.mandatory == null ? false : Boolean(row.mandatory),
    ...copyTimestamps(row),
  };
}

export function mapQuestionTranslation(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    questionId: row.QuestionId ?? row.questionId,
    language: row.language,
    description: row.description,
    positive: row.positive,
    negative: row.negative,
    ...copyTimestamps(row),
  };
}

export function mapQuestionUser(row) {
  return {
    eventId: eventIdOf(row),
    userId: row.UserId ?? row.userId,
    questionId: row.QuestionId ?? row.questionId,
    ...copyTimestamps(row),
  };
}
