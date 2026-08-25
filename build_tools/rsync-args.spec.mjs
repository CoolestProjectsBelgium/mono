import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RSYNC_EXCLUDES, buildRsyncArgs, rsyncDestination } from './lib/rsync.mjs';

test('rsync excludes .env and uses --delete', () => {
  const args = buildRsyncArgs({
    source: '/tmp/stage/api-dev',
    destination: 'nj10446@host:app',
  });
  assert.ok(args.includes('--delete'));
  assert.ok(args.includes('.env'));
  assert.deepEqual(
    RSYNC_EXCLUDES.filter((name) => args.includes(name)),
    RSYNC_EXCLUDES,
  );
  assert.equal(args.at(-2), '/tmp/stage/api-dev/');
  assert.equal(args.at(-1), 'nj10446@host:app');
});

test('dry-run adds --dry-run', () => {
  const args = buildRsyncArgs({
    source: 'stage',
    destination: 'user@host:app',
    dryRun: true,
  });
  assert.ok(args.includes('--dry-run'));
});

test('rsync destination shape', () => {
  assert.equal(
    rsyncDestination({ sshUser: 'nj10446', sshHost: 'web.example', remotePath: 'app' }),
    'nj10446@web.example:app',
  );
});
