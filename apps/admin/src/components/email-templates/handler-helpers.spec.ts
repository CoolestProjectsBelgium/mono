import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildLoadKey,
  getContextRecordType,
  normalizeSavePayload,
} from './handler-helpers.js';

test('buildLoadKey combines eventId template and language', () => {
  assert.equal(buildLoadKey(1, 'registration', 'nl'), '1:registration:nl');
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

test('getContextRecordType maps template slugs to the mailer entity kind', () => {
  assert.equal(getContextRecordType('registration'), 'registration');
  assert.equal(getContextRecordType('welcomeOwner'), 'user');
  assert.equal(getContextRecordType('registrationReminder'), 'registration');
  assert.equal(getContextRecordType('dailyReminder'), 'user');
});
