import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assertNotJudge,
  buildPreviewContext,
  buildRecordContext,
  buildLoadKey,
  getContextRecordType,
  mapProjectPreview,
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

test('context records use the same root keys as the mailer', () => {
  assert.equal(getContextRecordType('registration'), 'registration');
  assert.equal(getContextRecordType('welcomeOwner'), 'user');
  assert.deepEqual(
    buildRecordContext('registration', { firstname: 'Jan' }),
    { registration: { firstname: 'Jan' } },
  );
});

test('mapProjectPreview maps project.name to the mailer title field', () => {
  assert.deepEqual(mapProjectPreview({ id: 42, name: 'Robot Dog' }), {
    id: 42,
    title: 'Robot Dog',
  });
  assert.equal(mapProjectPreview(null), undefined);
});

test('buildPreviewContext overlays a user and their project onto dummy mailer fields', () => {
  const dummy = {
    year: 2026,
    url: 'https://registration.coolestprojects.localhost:8443/login?token=x',
    token: 'x',
    website: 'https://coolestprojects.be',
    user: { firstname: 'Jan' },
    project: { id: 1, title: 'Dummy' },
    event: { id: 1 },
  };

  const context = buildPreviewContext({
    dummy,
    recordType: 'user',
    record: { id: 9, firstname: 'User 1 FN' },
    project: { id: 7, name: 'Real Title' },
  });

  assert.equal((context.user as { firstname: string }).firstname, 'User 1 FN');
  assert.deepEqual(context.project, { id: 7, title: 'Real Title' });
  assert.equal(context.year, 2026);
  assert.equal(context.url, dummy.url);
});

test('buildPreviewContext omits project when the user has no membership', () => {
  const context = buildPreviewContext({
    dummy: {
      year: 2026,
      project: { id: 1, title: 'Dummy' },
      user: { firstname: 'Jan' },
    },
    recordType: 'user',
    record: { firstname: 'User 1 FN' },
    project: null,
  });

  assert.equal(context.project, undefined);
  assert.equal((context.user as { firstname: string }).firstname, 'User 1 FN');
});

test('buildPreviewContext keeps dummy project for registration records', () => {
  const dummy = {
    project: { id: 1, title: 'Dummy' },
    registration: { firstname: 'Jan' },
  };
  const context = buildPreviewContext({
    dummy,
    recordType: 'registration',
    record: { firstname: 'Lisa' },
  });

  assert.equal((context.registration as { firstname: string }).firstname, 'Lisa');
  assert.deepEqual(context.project, dummy.project);
});
