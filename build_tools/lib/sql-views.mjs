import fs from 'node:fs';
import path from 'node:path';
import { BUILD_TOOLS_ROOT, REPO_ROOT } from './targets.mjs';

/**
 * Admin SQL view sources (no file extension).
 * @param {string} [repoRoot]
 */
export function sqlViewsSourceDir(repoRoot = REPO_ROOT) {
  return path.join(repoRoot, 'apps/admin/src/components/admin/SQL-data');
}

/**
 * @param {string} sourceDir
 * @returns {string[]}
 */
export function listSqlViewFiles(sourceDir) {
  if (!fs.existsSync(sourceDir)) {
    return [];
  }
  return fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.') && entry.name !== 'README.md')
    .map((entry) => entry.name)
    .sort();
}

/**
 * Copy admin SQL view files into the api deploy artifact.
 *
 * @param {{ repoRoot?: string, stageDir: string }} input
 */
export function stageSqlViews(input) {
  const sourceDir = sqlViewsSourceDir(input.repoRoot ?? REPO_ROOT);
  const files = listSqlViewFiles(sourceDir);
  const viewsDir = path.join(input.stageDir, 'sql-views');
  fs.mkdirSync(viewsDir, { recursive: true });

  for (const name of files) {
    fs.copyFileSync(path.join(sourceDir, name), path.join(viewsDir, name));
  }

  const scriptSrc = path.join(BUILD_TOOLS_ROOT, 'scripts', 'apply-views.cjs');
  fs.copyFileSync(scriptSrc, path.join(input.stageDir, 'apply-views.cjs'));
  return files;
}

/**
 * @param {{ remotePath: string }} target
 * @returns {string}
 */
export function remoteApplyViewsCommand(target) {
  const appDir = target.remotePath.replace(/\/$/, '');
  return `cd ${shellSingleQuote(appDir)} && node apply-views.cjs`;
}

function shellSingleQuote(value) {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
