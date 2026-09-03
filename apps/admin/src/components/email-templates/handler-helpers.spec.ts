import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertNotJudge,
  buildLoadKey,
  normalizeSavePayload,
} from './handler-helpers.js';

test('buildLoadKey combines eventId template and language', () => {
  assert.equal(buildLoadKey(1, 'registration', 'nl'), '1:registration:nl');
});

test('assertNotJudge rejects judge role', () => {
  assert.throws(() => assertNotJudge('judge'), /Judges cannot access/);
  assert.doesNotThrow(() => assertNotJudge('admin'));
});

test('normalizeSavePayload preserves both rich and plain content', () => {
  const payload = normalizeSavePayload({
    template: 'registration',
    language: 'nl',
    subject: 'Hello',
    contentRich: '<p>rich</p>',
    contentPlain: 'plain',
  });

  assert.equal(payload.contentRich, '<p>rich</p>');
  assert.equal(payload.contentPlain, 'plain');
});

test('normalizeSavePayload rejects unsupported language', () => {
  assert.throws(
    () => normalizeSavePayload({ template: 'registration', language: 'de' }),
    /Unsupported language/,
  );
});
