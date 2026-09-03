import { copyTimestamps, eventIdOf, projectIdOf } from './helpers.mjs';

export function mapVoteCategory(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    name: row.name,
    min: row.min,
    max: row.max,
    public: Boolean(row.public),
    optional: Boolean(row.optional),
    ...copyTimestamps(row),
  };
}

export function mapVote(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    projectId: projectIdOf(row),
    categoryId: row.categoryId ?? row.VoteCategoryId,
    accountId: row.accountId,
    amount: row.amount,
    ...copyTimestamps(row),
  };
}

export function mapCertificate(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    projectId: projectIdOf(row),
    text: row.text,
    ...copyTimestamps(row),
  };
}

export function mapMessage(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    message: row.message,
    startAt: row.startAt,
    endAt: row.endAt,
  };
}
