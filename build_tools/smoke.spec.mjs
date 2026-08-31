import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  probeLocalhost,
  SMOKE_OK_CODES,
  smokeLocalhost,
} from './lib/smoke.mjs';

test('probeLocalhost returns null when ssh curl fails', () => {
  const code = probeLocalhost({
    sshUser: 'u',
    sshHost: 'h',
    port: 3001,
    smokePath: '/api',
    runImpl: () => {
      throw new Error('exited 7');
    },
  });
  assert.equal(code, null);
});

test('smokeLocalhost retries until a success code', async () => {
  let calls = 0;
  const sleeps = [];
  const code = await smokeLocalhost(
    {
      sshUser: 'u',
      sshHost: 'h',
      port: 3001,
      smokePath: '/api',
      runImpl: () => {
        calls += 1;
        if (calls < 3) {
          throw new Error('exited 7');
        }
        return { stdout: '200\n' };
      },
    },
    {
      attempts: 5,
      intervalMs: 1,
      initialDelayMs: 0,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    },
  );

  assert.equal(code, '200');
  assert.equal(calls, 3);
  assert.ok(sleeps.length >= 2);
});

test('smokeLocalhost fails after exhausting attempts', async () => {
  await assert.rejects(
    () => smokeLocalhost(
      {
        sshUser: 'u',
        sshHost: 'h',
        port: 3000,
        smokePath: '/admin',
        runImpl: () => {
          throw new Error('exited 7');
        },
      },
      {
        attempts: 2,
        intervalMs: 0,
        initialDelayMs: 0,
        sleep: async () => {},
      },
    ),
    /did not return 200\/301\/302 after 2 attempts/,
  );
});

test('SMOKE_OK_CODES accepts redirects', () => {
  assert.ok(SMOKE_OK_CODES.has('301'));
  assert.ok(SMOKE_OK_CODES.has('302'));
});
