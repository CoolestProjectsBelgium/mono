import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mapProject } from './project.mjs';

test('mapProject remaps names and appends youtube urls', () => {
  const mapped = mapProject(
    {
      id: 9,
      eventId: 1,
      project_name: 'Robot Cat',
      project_descr: 'A robot',
      project_type: 'hardware',
      project_lang: 'nl',
      internalinfo: 'jury note',
      max_tokens: 3,
      ownerId: 1,
    },
    ['https://youtu.be/abc'],
  );
  assert.equal(mapped.name, 'Robot Cat');
  assert.equal(mapped.description, 'A robot');
  assert.equal(mapped.type, 'hardware');
  assert.equal(mapped.language, 'nl');
  assert.equal(mapped.maxVoucher, 3);
  assert.equal(mapped.deletedAt, null);
  assert.equal(mapped.internalInformation, 'jury note\nhttps://youtu.be/abc');
  assert.equal('ownerId' in mapped, false);
});
