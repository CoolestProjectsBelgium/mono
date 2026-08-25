import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadTargets, resolveTarget } from './lib/targets.mjs';

test('every published app has dev and prod targets', () => {
  const { committed } = loadTargets();
  for (const [name, app] of Object.entries(committed.apps)) {
    assert.ok(app.dev, `${name} missing dev`);
    assert.ok(app.prod, `${name} missing prod`);
    assert.ok(app.dev.componentId, `${name} dev componentId`);
    assert.ok(app.prod.componentId, `${name} prod componentId`);
    assert.ok(app.dev.sshUser, `${name} dev sshUser`);
    assert.ok(app.prod.sshUser, `${name} prod sshUser`);
  }
  assert.equal(committed.apps.presentation, undefined);
});

test('resolveTarget rejects unknown env', () => {
  const { committed, localPath } = loadTargets();
  assert.throws(
    () => resolveTarget({
      committed,
      local: { sshHost: 'host.example' },
      localPath,
      app: 'api',
      env: 'staging',
    }),
    /Unknown --env/,
  );
});

test('resolveTarget requires sshHost from local config', () => {
  const { committed, localPath } = loadTargets();
  assert.throws(
    () => resolveTarget({
      committed,
      local: {},
      localPath,
      app: 'api',
      env: 'dev',
    }),
    /SSH host is not set/,
  );
});

test('resolveTarget maps api-dev component and user', () => {
  const { committed, localPath } = loadTargets();
  const target = resolveTarget({
    committed,
    local: { sshHost: 'web.level27.eu' },
    localPath,
    app: 'api',
    env: 'dev',
  });
  assert.equal(target.componentId, 74461);
  assert.equal(target.sshUser, 'nj10446');
  assert.equal(target.port, 3001);
  assert.equal(target.kind, 'node');
});

test('prod dry-run target uses prod user and path', () => {
  const { committed, localPath } = loadTargets();
  const target = resolveTarget({
    committed,
    local: { sshHost: 'web.level27.eu' },
    localPath,
    app: 'api',
    env: 'prod',
  });
  assert.equal(target.sshUser, 'nj10447');
  assert.equal(target.componentName, 'api-prod');
  assert.equal(target.remotePath, 'app');
});
