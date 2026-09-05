import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getApiBaseUrl,
  getCookieHeader,
  isUnsafeMethod,
  mergeCookieHeader,
  parseSetCookieHeaders,
} from './nest-fetch.js';

test('getCookieHeader reads cookie from request headers', () => {
  assert.equal(
    getCookieHeader({ headers: { cookie: 'adminjs=s%3Aabc.sig' } }),
    'adminjs=s%3Aabc.sig',
  );
});

test('parseSetCookieHeaders extracts cookie names and values', () => {
  assert.deepEqual(
    parseSetCookieHeaders([
      'anonId=123; Path=/; HttpOnly',
      '__Host-csrf-token=token; Path=/; HttpOnly',
    ]),
    {
      anonId: '123',
      '__Host-csrf-token': 'token',
    },
  );
});

test('mergeCookieHeader combines incoming and bootstrap cookies', () => {
  const merged = mergeCookieHeader('adminjs=s%3Aabc.sig', { anonId: '123' });
  assert.match(merged, /adminjs=s%3Aabc\.sig/);
  assert.match(merged, /anonId=123/);
});

test('isUnsafeMethod identifies mutating HTTP verbs', () => {
  assert.equal(isUnsafeMethod('GET'), false);
  assert.equal(isUnsafeMethod('POST'), true);
});

test('uses the local API process for AdminJS server-side development fetches', () => {
  const previousBase = process.env.API_BASE_URL;
  const previousNodeEnv = process.env.NODE_ENV;

  process.env.API_BASE_URL = 'https://api.coolestprojects.localhost:8443';
  delete process.env.NODE_ENV;

  assert.equal(getApiBaseUrl(), 'http://127.0.0.1:3001');

  process.env.NODE_ENV = 'production';
  assert.equal(getApiBaseUrl(), 'https://api.coolestprojects.localhost:8443');

  if (previousBase === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = previousBase;
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
});
