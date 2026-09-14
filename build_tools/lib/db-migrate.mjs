/**
 * @param {{ remotePath: string }} target
 * @returns {string}
 */
export function remoteMigrateCommand(target) {
  const appDir = target.remotePath.replace(/\/$/, '');
  return `cd ${shellSingleQuote(appDir)} && node dist/cli db:migrate`;
}

function shellSingleQuote(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
