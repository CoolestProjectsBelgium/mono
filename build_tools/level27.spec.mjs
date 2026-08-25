import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restartComponent, restartRequest } from './lib/level27.mjs';

test('restart request targets the component actions endpoint', () => {
  const request = restartRequest({ appId: 21746, componentId: 74461 });
  assert.equal(
    request.url,
    'https://api.level27.eu/v1/apps/21746/components/74461/actions',
  );
  assert.equal(request.method, 'POST');
  assert.deepEqual(request.body, { type: 'restart' });
});

test('restartComponent sends the raw API key in Authorization', async () => {
  const calls = [];
  await restartComponent({
    appId: 21746,
    componentId: 74461,
    apiKey: 'test-key',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return { ok: true, status: 200, text: async () => '' };
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.headers.Authorization, 'test-key');
  assert.equal(JSON.parse(calls[0].init.body).type, 'restart');
});

test('restartComponent fails without an API key', async () => {
  await assert.rejects(
    () => restartComponent({ appId: 1, componentId: 2, apiKey: '' }),
    /LEVEL27_API_KEY/,
  );
});
