import { run } from './run.mjs';

/**
 * @param {{ sshUser: string, sshHost: string, command: string, runImpl?: typeof run }} input
 */
export function sshExec(input) {
  const runImpl = input.runImpl ?? run;
  return runImpl('ssh', [
    '-o',
    'BatchMode=yes',
    '-o',
    'StrictHostKeyChecking=accept-new',
    `${input.sshUser}@${input.sshHost}`,
    input.command,
  ]);
}

/**
 * @param {{ sshUser: string, sshHost: string, remotePath: string, runImpl?: typeof run }} input
 */
export function remoteFileExists(input) {
  const result = sshExec({
    ...input,
    command: `test -f ${shellSingleQuote(`${input.remotePath.replace(/\/$/, '')}/.env`)} && echo yes || echo no`,
  });
  return result.stdout.trim() === 'yes';
}

/**
 * @param {{ sshUser: string, sshHost: string, remotePath: string, content: string, runImpl?: typeof run }} input
 */
export function uploadTextFile(input) {
  const remote = `${input.remotePath.replace(/\/$/, '')}/.env`;
  const encoded = Buffer.from(input.content, 'utf8').toString('base64');
  sshExec({
    ...input,
    command: `mkdir -p ${shellSingleQuote(input.remotePath)} && echo ${shellSingleQuote(encoded)} | base64 -d > ${shellSingleQuote(remote)}`,
  });
}

/**
 * Level27 systemd unit (`njXXXX.service`) respawns `node main.js` after SIGTERM.
 * CP4 `POST .../actions {type:restart}` returns 400 for nodejs components.
 * @returns {string}
 */
export function restartNodeCommand() {
  return 'pkill -u "$(id -u)" -f \'[n]ode main.js\' || true';
}

function shellSingleQuote(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
