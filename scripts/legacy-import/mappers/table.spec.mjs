import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapAssignedTables } from './table.mjs';

test('mapAssignedTables keeps only assigned seats and drops timeslots', () => {
  const rows = mapAssignedTables(
    [
      {
        id: 1,
        ProjectId: 9,
        TableId: 20,
        EventId: 1,
        startTime: '10:00:00',
        endTime: '11:00:00',
      },
    ],
    [
      { id: 20, name: 'A1', maxPlaces: 4, requirements: null, eventId: 1 },
      { id: 21, name: 'Unused', maxPlaces: 2, eventId: 1 },
    ],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 20);
  assert.equal(rows[0].projectId, 9);
  assert.equal(rows[0].name, 'A1');
  assert.equal('startTime' in rows[0], false);
  assert.equal('LocationId' in rows[0], false);
});
