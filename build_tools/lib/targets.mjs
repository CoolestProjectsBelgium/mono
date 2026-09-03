import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BUILD_TOOLS_ROOT = path.resolve(__dirname, '..');
export const REPO_ROOT = path.resolve(BUILD_TOOLS_ROOT, '..');

const ENVIRONMENTS = new Set(['dev', 'prod']);

/**
 * @param {string} [repoRoot]
 */
export function loadTargets(repoRoot = REPO_ROOT) {
  const committedPath = path.join(repoRoot, 'build_tools', 'targets.json');
  const localPath = path.join(repoRoot, 'build_tools', 'targets.local.json');
  const committed = JSON.parse(fs.readFileSync(committedPath, 'utf8'));
  let local = {};
  if (fs.existsSync(localPath)) {
    local = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  return { committed, local, localPath, committedPath };
}

/**
 * @param {{ committed: object, local: object, app: string, env: string, localPath: string }} input
 */
export function resolveTarget(input) {
  const { committed, local, app, env, localPath } = input;
  if (!ENVIRONMENTS.has(env)) {
    throw new Error(`Unknown --env ${env}. Use dev or prod.`);
  }

  const appConfig = committed.apps?.[app];
  if (!appConfig) {
    const known = Object.keys(committed.apps ?? {}).join(', ');
    throw new Error(`Unknown --app ${app}. Known: ${known}`);
  }

  const envConfig = appConfig[env];
  if (!envConfig) {
    throw new Error(`App ${app} has no ${env} target.`);
  }

  const overrideKey = `${app}-${env}`;
  const fromLocal = local.overrides?.[overrideKey] || local.sshHost;
  const sshHost =
    (fromLocal && !String(fromLocal).startsWith('SET_ME') ? fromLocal : null)
    || process.env.L27_SSH_HOST
    || envConfig.sshHost;

  if (!sshHost || sshHost.startsWith('SET_ME')) {
    throw new Error(
      `SSH host is not set. Copy build_tools/targets.local.json.example to ${localPath} and set sshHost, or export L27_SSH_HOST.`,
    );
  }

  return {
    appId: committed.appId,
    app,
    env,
    kind: appConfig.kind,
    workspace: appConfig.workspace,
    databaseWorkspace: appConfig.databaseWorkspace,
    entry: appConfig.entry,
    module: appConfig.module,
    generate: appConfig.generate,
    generateEnv: appConfig.generateEnv?.[env] ?? {},
    requiredEnv: appConfig.requiredEnv ?? [],
    sshHost,
    ...envConfig,
  };
}

export function listApps(committed, options = {}) {
  return Object.keys(committed.apps).filter((name) => {
    if (options.deployAll && committed.apps[name].operatorOnly) {
      return false;
    }
    return true;
  });
}
