import assert from 'node:assert/strict';
import { test } from 'node:test';
import { main } from './bin/deploy-all.mjs';
import { listApps, loadTargets } from './lib/targets.mjs';

test('deploy-all invokes all apps in targets.json order', async () => {
  const { committed } = loadTargets();
  const expectedApps = listApps(committed);
  const calls = [];

  const code = await main(['--env', 'dev'], {
    deployMain: async (argv) => {
      calls.push([...argv]);
      return 0;
    },
  });

  assert.equal(code, 0);
  assert.deepEqual(
    calls.map((argv) => argv.join(' ')),
    expectedApps.map((app) => `--app ${app} --env dev`),
  );
});

test('deploy-all continues after a failure and exits non-zero', async () => {
  const { committed } = loadTargets();
  const expectedApps = listApps(committed);
  const calls = [];

  const code = await main(['--env', 'dev'], {
    deployMain: async (argv) => {
      calls.push(argv[1]);
      if (argv[1] === 'api') {
        throw new Error('pack failed');
      }
      return 0;
    },
  });

  assert.equal(code, 1);
  assert.deepEqual(calls, expectedApps);
});

test('deploy-all records non-zero exit codes as failures', async () => {
  const calls = [];

  const code = await main(['--env', 'dev'], {
    deployMain: async (argv) => {
      calls.push(argv[1]);
      return argv[1] === 'admin' ? 1 : 0;
    },
  });

  assert.equal(code, 1);
  assert.equal(calls.length, listApps(loadTargets().committed).length);
});

test('deploy-all rejects prod', async () => {
  await assert.rejects(
    () => main(['--env', 'prod'], { deployMain: async () => 0 }),
    /only supports --env dev/,
  );
});

test('deploy-all requires --env', async () => {
  await assert.rejects(
    () => main([], { deployMain: async () => 0 }),
    /--env is required/,
  );
});
