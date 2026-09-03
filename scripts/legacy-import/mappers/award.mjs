import { copyTimestamps, eventIdOf, projectIdOf } from './helpers.mjs';

export function mapAward(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    projectId: projectIdOf(row),
    categoryId: row.VoteCategoryId ?? row.categoryId ?? null,
    text: '',
    ...copyTimestamps(row),
  };
}
