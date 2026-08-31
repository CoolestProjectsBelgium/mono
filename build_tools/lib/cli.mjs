/**
 * @param {string[]} argv
 */
export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token === '--skip-build') {
      args.skipBuild = true;
      continue;
    }
    if (token === '--skip-npm-install') {
      args.skipNpmInstall = true;
      continue;
    }
    if (token === '--skip-smoke') {
      args.skipSmoke = true;
      continue;
    }
    if (token === '--skip-restart') {
      args.skipRestart = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = argv[i + 1];
      if (value == null || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }
      args[camelCase(key)] = value;
      i += 1;
      continue;
    }
    args._.push(token);
  }
  return args;
}

function camelCase(value) {
  return value.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
}

export function usage() {
  return `Publish a monorepo app to the Level27 Agency estate.

Usage:
  node build_tools/bin/deploy.mjs --app api --env dev
  node build_tools/bin/deploy.mjs --app api --env prod --dry-run

Options:
  --app            api | admin | registration | voting | eventguide
  --env            dev | prod
  --dry-run        Print actions; do not rsync, restart, or write .env
  --skip-build     Use existing dist / generate output
  --skip-npm-install
  --skip-restart   Skip SSH pkill of node main.js (systemd respawns it)
  --skip-smoke     Skip SSH localhost HTTP smoke check
`;
}
