import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapUserProjects } from './user-project.mjs';

const project = {
  id: 9,
  eventId: 1,
  ownerId: 1,
};

test('mapUserProjects marks matching voucher as owner and does not duplicate', () => {
  const rows = mapUserProjects(
    [project],
    [
      { idx: 1, id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', participantId: 1, projectId: 9, eventId: 1 },
      { idx: 2, id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', participantId: 2, projectId: 9, eventId: 1 },
      { idx: 3, id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', participantId: null, projectId: 9, eventId: 1 },
    ],
  );
  assert.equal(rows.length, 3);
  const owner = rows.filter((row) => row.isOwner);
  assert.equal(owner.length, 1);
  assert.equal(owner[0].userId, 1);
  assert.equal(owner[0].voucherGuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  const guest = rows.find((row) => row.userId === 2);
  assert.equal(guest.isOwner, false);
  const unused = rows.find((row) => row.userId == null);
  assert.equal(unused.voucherGuid, 'cccccccc-cccc-cccc-cccc-cccccccccccc');
});

test('mapUserProjects creates an owner row when no voucher matches ownerId', () => {
  const rows = mapUserProjects([project], [], { uuid: () => 'generated-guid' });
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], {
    isOwner: true,
    voucherGuid: 'generated-guid',
    projectId: 9,
    userId: 1,
    eventId: 1,
    deletedAt: null,
  });
});
