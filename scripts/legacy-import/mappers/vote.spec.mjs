import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapVote } from './vote.mjs';

test('mapVote copies jury votes and does not invent public-vote fields', () => {
  const mapped = mapVote({
    id: 1,
    amount: 8,
    eventId: 1,
    categoryId: 2,
    projectId: 9,
    accountId: 3,
    phone: '0470000000',
  });
  assert.equal(mapped.accountId, 3);
  assert.equal(mapped.amount, 8);
  assert.equal('phone' in mapped, false);
});
