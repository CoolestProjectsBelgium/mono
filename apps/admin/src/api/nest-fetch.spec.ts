import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
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
