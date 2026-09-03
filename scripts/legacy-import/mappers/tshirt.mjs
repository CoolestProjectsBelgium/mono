import { copyTimestamps, eventIdOf } from './helpers.mjs';

export function mapTshirtGroup(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    name: row.name,
    ...copyTimestamps(row),
  };
}

export function mapTshirt(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    groupId: row.groupId,
    name: row.name,
    ...copyTimestamps(row),
  };
}

export function mapTshirtTranslation(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    tshirtId: row.TShirtId ?? row.tshirtId,
    language: row.language,
    description: row.description,
    ...copyTimestamps(row),
  };
}

export function mapTshirtGroupTranslation(row) {
  return {
    id: row.id,
    eventId: eventIdOf(row),
    groupId: row.TShirtGroupId ?? row.groupId,
    language: row.language,
    description: row.description,
    ...copyTimestamps(row),
  };
}
