import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { bundleAdminComponents } from './lib/admin-bundle.mjs';

test('bundleAdminComponents copies bundle.js to frontend/assets', () => {
  const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdj-admin-bundle-'));
  fs.mkdirSync(path.join(stageDir, '.adminjs'), { recursive: true });
  fs.writeFileSync(path.join(stageDir, '.adminjs', 'bundle.js'), 'window.AdminJSCustom = {}');

  bundleAdminComponents({
    stageDir,
    runImpl: () => ({ status: 0, stdout: '', stderr: '' }),
  });

  assert.equal(
    fs.readFileSync(path.join(stageDir, 'frontend', 'assets', 'components.bundle.js'), 'utf8'),
    'window.AdminJSCustom = {}',
  );
  assert.equal(fs.existsSync(path.join(stageDir, '.bundle-adminjs.mjs')), false);
  fs.rmSync(stageDir, { recursive: true, force: true });
});

test('bundleAdminComponents throws when Rollup did not write bundle.js', () => {
  const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdj-admin-bundle-missing-'));
  assert.throws(
    () => bundleAdminComponents({
      stageDir,
      runImpl: () => ({ status: 0, stdout: '', stderr: '' }),
    }),
    /was not created/,
  );
  fs.rmSync(stageDir, { recursive: true, force: true });
});
