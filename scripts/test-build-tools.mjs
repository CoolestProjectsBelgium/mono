import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'build_tools');
const files = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith('.spec.mjs'))
  .map((name) => path.join(dir, name));

if (files.length === 0) {
  console.error('No build_tools/*.spec.mjs files found');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
