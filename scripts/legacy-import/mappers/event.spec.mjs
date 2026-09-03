import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  DEFAULT_ALLOWED_MIME_TYPES,
  DEFAULT_FLOORPLAN_PATH,
  mapEvent,
} from './event.mjs';

test('mapEvent copies azure container and title, fills missing columns', () => {
  const mapped = mapEvent({
    id: 1,
    azure_storage_container: 'coolestproject',
    event_title: 'Coolest Projects 2021',
    minAge: 7,
    maxAge: 18,
    minGuardianAge: 16,
    maxRegistration: 64,
    maxVoucher: 3,
    officialStartDate: '2021-04-18 09:00:00',
    eventBeginDate: '2021-01-01 00:00:00',
    registrationOpenDate: '2021-01-15 00:00:00',
    registrationClosedDate: '2021-03-01 00:00:00',
    projectClosedDate: '2021-04-01 00:00:00',
    eventEndDate: '2021-04-19 18:00:00',
    maxFileSize: 123,
    createdAt: '2021-01-01 00:00:00',
    updatedAt: '2021-01-02 00:00:00',
  });

  assert.equal(mapped.id, 1);
  assert.equal(mapped.folderName, 'coolestproject');
  assert.equal(mapped.eventTitle, 'Coolest Projects 2021');
  assert.equal(mapped.floorplanPath, DEFAULT_FLOORPLAN_PATH);
  assert.deepEqual(mapped.allowedMimeTypes, DEFAULT_ALLOWED_MIME_TYPES);
  assert.equal(mapped.votingStartDate, '2021-04-18 09:00:00');
  assert.equal(mapped.votingEndDate, '2021-04-19 18:00:00');
});
