import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planEnvBootstrap } from './lib/env-bootstrap.mjs';

const secretsPath = 'build_tools/secrets/api-dev.env';
const exampleText = 'API_PORT=3001\nDB_HOST=\nJWT_KEY=\n';
const secretsText = 'DB_HOST=db.internal\nJWT_KEY=secret\n';

test('skips when remote .env already exists', () => {
  const plan = planEnvBootstrap({
    remoteExists: true,
    exampleText,
    secretsText,
    requiredKeys: ['DB_HOST', 'JWT_KEY'],
    secretsPath,
  });
  assert.equal(plan.action, 'skip');
  assert.equal(plan.content, undefined);
});

test('creates merged env the first time', () => {
  const plan = planEnvBootstrap({
    remoteExists: false,
    exampleText,
    secretsText,
    requiredKeys: ['DB_HOST', 'JWT_KEY'],
    secretsPath,
  });
  assert.equal(plan.action, 'create');
  assert.match(plan.content, /API_PORT=3001/);
  assert.match(plan.content, /DB_HOST=db.internal/);
  assert.match(plan.content, /JWT_KEY=secret/);
});

test('fails first-time without secrets file', () => {
  assert.throws(
    () => planEnvBootstrap({
      remoteExists: false,
      exampleText,
      secretsText: null,
      requiredKeys: ['JWT_KEY'],
      secretsPath,
    }),
    /Create build_tools\/secrets\/api-dev.env/,
  );
});

test('fails first-time when required secrets are blank', () => {
  assert.throws(
    () => planEnvBootstrap({
      remoteExists: false,
      exampleText,
      secretsText: 'JWT_KEY=\n',
      requiredKeys: ['DB_HOST', 'JWT_KEY'],
      secretsPath,
    }),
    /DB_HOST/,
  );
});
