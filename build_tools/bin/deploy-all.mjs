#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../lib/cli.mjs';
import { listApps, loadTargets } from '../lib/targets.mjs';
import { main as deployMain } from './deploy.mjs';

/**
 * @param {string[]} argv
 * @param {{ deployMain?: (argv: string[]) => Promise<number> }} [deps]
 */
export async function main(argv = process.argv.slice(2), deps = {}) {
  const deploy = deps.deployMain ?? deployMain;
  const args = parseArgs(argv);

  if (args.help) {
    process.stdout.write(usage());
    return 0;
  }

  if (!args.env) {
    throw new Error(`--env is required.\n${usage()}`);
  }

  if (args.env !== 'dev' && args.env !== 'prod') {
    throw new Error('deploy-all only supports --env dev or --env prod.');
  }

  const { committed } = loadTargets();
  const apps = listApps(committed);
  const failures = [];

  for (const app of apps) {
    process.stdout.write(`\n=== Deploy ${app} (${args.env}) ===\n`);
    try {
      const code = await deploy(['--app', app, '--env', args.env]);
      if (code !== 0) {
        failures.push(app);
        process.stderr.write(`Deploy ${app} failed with exit code ${code}\n`);
      }
    } catch (error) {
      failures.push(app);
      process.stderr.write(`Deploy ${app} failed: ${error.message || error}\n`);
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`\nFailed apps: ${failures.join(', ')}\n`);
    return 1;
  }

  process.stdout.write('\nAll apps deployed successfully.\n');
  return 0;
}

function usage() {
  return `Publish every Level27 app to the test (dev) or production estate.

Usage:
  node build_tools/bin/deploy-all.mjs --env dev
  node build_tools/bin/deploy-all.mjs --env prod

Options:
  --env            dev | prod
`;
}

const isDirect =
  process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirect) {
  main().then(
    (code) => process.exit(code),
    (error) => {
      console.error(error.message || error);
      process.exit(1);
    },
  );
}
