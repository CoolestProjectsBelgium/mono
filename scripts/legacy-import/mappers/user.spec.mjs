import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapUser } from './user.mjs';

test('mapUser sets via_type other when via is non-empty', () => {
  const mapped = mapUser({
    id: 1,
    EventId: 1,
    sizeId: 4,
    via: 'School X',
    language: 'nl',
    postalcode: 1000,
    municipality_name: 'Brussel',
    email: 'owner@example.test',
    firstname: 'Ada',
    lastname: 'Lovelace',
    sex: 'f',
    street: 'secret street',
    house_number: '1',
    box_number: '2',
  });
  assert.equal(mapped.eventId, 1);
  assert.equal(mapped.tshirtId, 4);
  assert.equal(mapped.via, 'School X');
  assert.equal(mapped.via_type, 'other');
  assert.equal('street' in mapped, false);
  assert.equal('house_number' in mapped, false);
  assert.equal('box_number' in mapped, false);
});

test('mapUser sets via_type null when via is empty', () => {
  const mapped = mapUser({
    id: 2,
    eventId: 1,
    via: '   ',
    language: 'en',
    postalcode: 2000,
    sex: 'm',
  });
  assert.equal(mapped.via, null);
  assert.equal(mapped.via_type, null);
});
