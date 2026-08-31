import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
  listSqlViewFiles,
  remoteApplyViewsCommand,
  sqlViewsSourceDir,
  stageSqlViews,
} from './lib/sql-views.mjs';
import { REPO_ROOT } from './lib/targets.mjs';

test('sqlViewsSourceDir points at admin SQL-data', () => {
  const dir = sqlViewsSourceDir(REPO_ROOT);
  assert.match(dir, /SQL-data$/);
  assert.equal(fs.existsSync(dir), true);
});

test('listSqlViewFiles returns view files without README', () => {
  const files = listSqlViewFiles(sqlViewsSourceDir(REPO_ROOT));
  assert.ok(files.length >= 1);
  assert.ok(files.some((name) => name.includes('Export')));
  assert.equal(files.includes('README.md'), false);
});

test('stageSqlViews copies views and apply script into api artifact', () => {
  const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdj-views-'));
  const files = stageSqlViews({ repoRoot: REPO_ROOT, stageDir });

  assert.ok(files.length >= 1);
  assert.equal(fs.existsSync(path.join(stageDir, 'apply-views.cjs')), true);
  for (const name of files) {
    assert.equal(fs.existsSync(path.join(stageDir, 'sql-views', name)), true);
  }

  fs.rmSync(stageDir, { recursive: true, force: true });
});

test('remoteApplyViewsCommand runs apply-views in remote app dir', () => {
  const command = remoteApplyViewsCommand({ remotePath: 'app' });
  assert.match(command, /cd 'app' && node apply-views\.cjs/);
});
