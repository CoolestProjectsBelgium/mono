import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ActionContext, ActionRequest } from 'adminjs';
import { restrictedPropertiesBeforeHook } from './before-hook.js';

const contextFor = (role: string | undefined) =>
  ({
    currentAdmin: role ? { role } : undefined,
    resource: {
      decorate: () => ({
        toJSON: () => ({
          properties: {
            email: {},
            account_type: { custom: { role: 'super_admin' } },
            twoFactorRequired: { custom: { role: 'super_admin' } },
          },
        }),
      }),
    },
  }) as unknown as ActionContext;

const post = (payload?: Record<string, unknown>) =>
  ({ method: 'post', payload }) as unknown as ActionRequest;

const run = (request: ActionRequest, role: string | undefined) =>
  restrictedPropertiesBeforeHook(request, contextFor(role)) as ActionRequest;

test('strips role-restricted fields from a payload posted by another role', () => {
  const request = post({
    email: 'a@example.be',
    account_type: 'super_admin',
    twoFactorRequired: false,
  });
  const result = run(request, 'admin');

  assert.deepEqual(result.payload, { email: 'a@example.be' });
  // The incoming request object is not mutated.
  assert.equal(request.payload?.account_type, 'super_admin');
});

test('keeps restricted fields for the role that owns them', () => {
  const request = post({ email: 'a@example.be', account_type: 'admin' });
  assert.equal(run(request, 'super_admin'), request);
});

test('treats a missing admin as having no role', () => {
  const result = run(post({ account_type: 'super_admin' }), undefined);
  assert.deepEqual(result.payload, {});
});

test('ignores non-POST requests and requests without a payload', () => {
  const get = {
    method: 'get',
    payload: { account_type: 'x' },
  } as unknown as ActionRequest;
  assert.equal(run(get, 'admin'), get);
  const empty = post(undefined);
  assert.equal(run(empty, 'admin'), empty);
});
