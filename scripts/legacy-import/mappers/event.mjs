import { copyTimestamps } from './helpers.mjs';

export const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const DEFAULT_FLOORPLAN_PATH = 'floorplan_active.svg';

export function mapEvent(row) {
  return {
    id: row.id,
    folderName: row.azure_storage_container ?? row.folderName,
    eventTitle: row.event_title ?? row.eventTitle,
    minAge: row.minAge,
    maxAge: row.maxAge,
    minGuardianAge: row.minGuardianAge,
    maxRegistration: row.maxRegistration,
    maxVoucher: row.maxVoucher,
    officialStartDate: row.officialStartDate,
    eventBeginDate: row.eventBeginDate,
    registrationOpenDate: row.registrationOpenDate,
    registrationClosedDate: row.registrationClosedDate,
    projectClosedDate: row.projectClosedDate,
    eventEndDate: row.eventEndDate,
    maxFileSize: row.maxFileSize,
    floorplanPath: DEFAULT_FLOORPLAN_PATH,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    votingStartDate: row.officialStartDate,
    votingEndDate: row.eventEndDate,
    ...copyTimestamps(row),
  };
}
