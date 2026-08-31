import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildSmokeUrl,
  probeUrl,
  SMOKE_OK_CODES,
  smokePublicUrl,
} from './lib/smoke.mjs';

test('buildSmokeUrl joins publicUrl and smokePath', () => {
  assert.equal(
    buildSmokeUrl({
      publicUrl: 'https://api-dev.coolestprojects-test.be',
      smokePath: '/api',
    }),
    'https://api-dev.coolestprojects-test.be/api',
  );
});

test('probeUrl returns null when fetch fails', async () => {
  const code = await probeUrl('https://example.test/api', async () => {
    throw new Error('network');
  });
  assert.equal(code, null);
});

test('smokePublicUrl retries until a success code', async () => {
  let calls = 0;
  const sleeps = [];
  const code = await smokePublicUrl(
    {
      publicUrl: 'https://api-dev.coolestprojects-test.be',
      smokePath: '/api',
    },
    {
      attempts: 5,
      intervalMs: 1,
      initialDelayMs: 0,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      fetchImpl: async () => {
        calls += 1;
        if (calls < 3) {
          throw new Error('network');
        }
        return { status: 200 };
      },
    },
  );

  assert.equal(code, '200');
  assert.equal(calls, 3);
  assert.ok(sleeps.length >= 2);
});

test('smokePublicUrl fails after exhausting attempts', async () => {
  await assert.rejects(
    () => smokePublicUrl(
      {
        publicUrl: 'https://admin-dev.coolestprojects-test.be',
        smokePath: '/admin',
      },
      {
        attempts: 2,
        intervalMs: 0,
        initialDelayMs: 0,
        sleep: async () => {},
        fetchImpl: async () => {
          throw new Error('network');
        },
      },
    ),
    /did not return 200\/301\/302 after 2 attempts/,
  );
});

test('SMOKE_OK_CODES accepts redirects', () => {
  assert.ok(SMOKE_OK_CODES.has('301'));
  assert.ok(SMOKE_OK_CODES.has('302'));
});
