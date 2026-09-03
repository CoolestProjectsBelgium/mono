import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapAccount } from './account.mjs';

test('mapAccount drops password hashes', () => {
  const mapped = mapAccount({
    id: 3,
    email: 'jury@example.test',
    password: '$2b$10$not-a-real-hash',
    account_type: 'jury',
  });
  assert.equal(mapped.id, 3);
  assert.equal(mapped.email, 'jury@example.test');
  assert.equal(mapped.account_type, 'jury');
  assert.equal(mapped.encryptedPassword, null);
  assert.equal('password' in mapped, false);
});
