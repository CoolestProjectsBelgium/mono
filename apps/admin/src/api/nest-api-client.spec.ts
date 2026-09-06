import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiClient, getApiBaseUrl } from './api-client.js';

test('getApiBaseUrl reads API_BASE_URL and strips a trailing slash', () => {
  const previous = process.env.API_BASE_URL;

  process.env.API_BASE_URL = 'https://api.coolestprojects.localhost:8443/';
  assert.equal(getApiBaseUrl(), 'https://api.coolestprojects.localhost:8443');

  if (previous === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = previous;
});

test('getApiBaseUrl throws when API_BASE_URL is not set', () => {
  const previous = process.env.API_BASE_URL;
  delete process.env.API_BASE_URL;

  assert.throws(() => getApiBaseUrl(), /API_BASE_URL/);

  if (previous === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = previous;
});

test('fromExpressRequest reads the Cookie header from rawHeaders when .headers is absent', async () => {
  // On current Node, IncomingMessage#headers is a lazy accessor rather than an
  // own property, so @adminjs/express's `Object.assign({}, req)` (used to build
  // the ActionRequest handed to page/dashboard handlers) drops it. Only
  // `rawHeaders` (an own property) survives that shallow copy, so that's the
  // only place a real AdminJS request ever actually has the cookie header.
  const previous = process.env.API_BASE_URL;
  process.env.API_BASE_URL = 'https://api.example.test';

  const adminJsShapedRequest = {
    method: 'get',
    rawHeaders: ['Host', 'admin.example.test', 'Cookie', 'adminjs=abc; anonId=xyz', 'Accept', '*/*'],
  };

  const api = await ApiClient.fromExpressRequest(adminJsShapedRequest);
  const cookieString = await (api as any).jar.getCookieString('https://api.example.test');
  assert.match(cookieString, /adminjs=abc/);
  assert.match(cookieString, /anonId=xyz/);

  if (previous === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = previous;
});
