import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapAward } from './award.mjs';

test('mapAward drops juror and uses empty text', () => {
  const mapped = mapAward({
    id: 2,
    VoteCategoryId: 8,
    EventId: 1,
    ProjectId: 9,
    JurorId: 44,
  });
  assert.equal(mapped.categoryId, 8);
  assert.equal(mapped.projectId, 9);
  assert.equal(mapped.text, '');
  assert.equal('JurorId' in mapped, false);
});
