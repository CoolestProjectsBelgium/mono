#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, usage } from '../lib/cli.mjs';
import { planEnvBootstrap } from '../lib/env-bootstrap.mjs';
import { packApp } from '../lib/pack.mjs';
import { BUILD_TOOLS_ROOT, loadTargets, resolveTarget } from '../lib/targets.mjs';
import { buildRsyncArgs, rsyncDestination } from '../lib/rsync.mjs';
import { run } from '../lib/run.mjs';
import { smokePublicUrl } from '../lib/smoke.mjs';
import { remoteFileExists, restartNodeCommand, sshExec, uploadTextFile } from '../lib/ssh.mjs';

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(usage());
    return 0;
  }

  if (!args.app || !args.env) {
    throw new Error(`--app and --env are required.\n${usage()}`);
  }

  const loaded = loadTargets();
  const target = resolveTarget({
    committed: loaded.committed,
    local: loaded.local,
    localPath: loaded.localPath,
    app: args.app,
    env: args.env,
  });

  const stageDir = path.join(BUILD_TOOLS_ROOT, '.stage', `${target.app}-${target.env}`);
  const dest = rsyncDestination(target);
  const envExamplePath = path.join(
    BUILD_TOOLS_ROOT,
    'env',
    `${target.app}-${target.env}.env.example`,
  );
  const secretsPath = path.join(BUILD_TOOLS_ROOT, 'secrets', `${target.app}-${target.env}.env`);

  process.stdout.write(
    `Deploy ${target.app} → ${target.componentName} (${target.sshUser}@${target.sshHost}:${target.remotePath})\n`,
  );

  if (args.dryRun) {
    printDryRun(target, { stageDir, dest, envExamplePath, secretsPath });
    return 0;
  }

  packApp({
    repoRoot: path.resolve(BUILD_TOOLS_ROOT, '..'),
    target,
    stageDir,
    skipBuild: args.skipBuild,
    skipNpmInstall: args.skipNpmInstall,
  });

  if (target.kind === 'node') {
    await bootstrapEnv({
      target,
      envExamplePath,
      secretsPath,
    });
  }

  const rsyncArgs = buildRsyncArgs({ source: stageDir, destination: dest });
  run('rsync', rsyncArgs, { stdio: 'inherit' });

  if (target.kind === 'node' && !args.skipRestart) {
    process.stdout.write('Restarting node via SSH (systemd respawn)...\n');
    sshExec({ ...target, command: restartNodeCommand() });
  }

  if (target.kind === 'node' && !args.skipSmoke) {
    await smokePublicUrl(target);
  }

  process.stdout.write('Deploy finished.\n');
  return 0;
}

function printDryRun(target, paths) {
  process.stdout.write(`kind=${target.kind} componentId=${target.componentId}\n`);
  process.stdout.write(`ssh=${target.sshUser}@${target.sshHost}\n`);
  process.stdout.write(`remotePath=${target.remotePath}\n`);
  process.stdout.write(`stageDir=${paths.stageDir}\n`);
  process.stdout.write(`rsync dest=${paths.dest}\n`);
  process.stdout.write(
    `rsync ${buildRsyncArgs({ source: paths.stageDir, destination: paths.dest }).join(' ')}\n`,
  );
  if (target.kind === 'node') {
    process.stdout.write(`env example=${paths.envExamplePath}\n`);
    process.stdout.write(`secrets=${paths.secretsPath}\n`);
    process.stdout.write(`restart ssh ${restartNodeCommand()}\n`);
    process.stdout.write(
      `smoke fetch ${target.publicUrl}${target.smokePath}\n`,
    );
  }
}

async function bootstrapEnv({ target, envExamplePath, secretsPath }) {
  const remoteExists = remoteFileExists(target);
  const exampleText = fs.existsSync(envExamplePath)
    ? fs.readFileSync(envExamplePath, 'utf8')
    : null;
  const secretsText = fs.existsSync(secretsPath)
    ? fs.readFileSync(secretsPath, 'utf8')
    : null;
  const plan = planEnvBootstrap({
    remoteExists,
    exampleText,
    secretsText,
    requiredKeys: target.requiredEnv,
    secretsPath,
  });
  if (plan.action === 'skip') {
    process.stdout.write('Remote .env exists — leaving it unchanged.\n');
    return;
  }
  process.stdout.write('Remote .env missing — creating it from example + secrets.\n');
  uploadTextFile({ ...target, content: plan.content });
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

export { main };
