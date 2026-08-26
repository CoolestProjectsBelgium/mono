import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseArgs } from './lib/cli.mjs';
import { main } from './bin/deploy.mjs';

test('parseArgs maps flags', () => {
  const args = parseArgs([
    '--app',
    'api',
    '--env',
    'dev',
    '--dry-run',
    '--skip-build',
  ]);
  assert.equal(args.app, 'api');
  assert.equal(args.env, 'dev');
  assert.equal(args.dryRun, true);
  assert.equal(args.skipBuild, true);
});

test('main requires app and env', async () => {
  await assert.rejects(() => main([]), /--app and --env are required/);
});

test('prod dry-run prints prod user and path without connecting', async () => {
  const previous = process.env.L27_SSH_HOST;
  process.env.L27_SSH_HOST = 'web.level27.eu';
  const chunks = [];
  const origWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, encoding, cb) => {
    chunks.push(String(chunk));
    if (typeof encoding === 'function') {
      encoding();
      return true;
    }
    if (typeof cb === 'function') {
      cb();
    }
    return true;
  };
  try {
    const code = await main(['--app', 'api', '--env', 'prod', '--dry-run']);
    assert.equal(code, 0);
    const text = chunks.join('');
    assert.match(text, /nj10447@/);
    assert.match(text, /api-prod/);
    assert.match(text, /--exclude \.env/);
    assert.match(text, /pkill -u/);
  } finally {
    process.stdout.write = origWrite;
    if (previous == null) {
      delete process.env.L27_SSH_HOST;
    } else {
      process.env.L27_SSH_HOST = previous;
    }
  }
});
