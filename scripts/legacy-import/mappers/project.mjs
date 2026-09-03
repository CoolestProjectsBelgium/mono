import { copyTimestamps, eventIdOf } from './helpers.mjs';
import { appendInternalInformation } from './hyperlink.mjs';

export function mapProject(row, extraUrls = []) {
  const base = row.internalinfo ?? row.internalInformation ?? '';
  return {
    id: row.id,
    eventId: eventIdOf(row),
    name: row.project_name ?? row.name,
    description: row.project_descr ?? row.description,
    type: row.project_type ?? row.type,
    language: row.project_lang ?? row.language,
    internalInformation: appendInternalInformation(base, extraUrls),
    maxVoucher: row.max_tokens ?? row.maxVoucher,
    deletedAt: null,
    ...copyTimestamps(row),
  };
}
