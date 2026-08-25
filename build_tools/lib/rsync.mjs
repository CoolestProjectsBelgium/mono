export const RSYNC_EXCLUDES = [
  '.env',
  'uploads/',
  'logs/',
  '.npm/',
  '.cache/',
  '.adminjs/',
];

/**
 * @param {{ source: string, destination: string, dryRun?: boolean }} input
 * @returns {string[]}
 */
export function buildRsyncArgs(input) {
  const args = ['-az', '--delete'];
  for (const exclude of RSYNC_EXCLUDES) {
    args.push('--exclude', exclude);
  }
  if (input.dryRun) {
    args.push('--dry-run');
  }
  const source = input.source.endsWith('/') ? input.source : `${input.source}/`;
  args.push(source, input.destination);
  return args;
}

/**
 * @param {{ sshUser: string, sshHost: string, remotePath: string }} input
 */
export function rsyncDestination(input) {
  return `${input.sshUser}@${input.sshHost}:${input.remotePath}`;
}
