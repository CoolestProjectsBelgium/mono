import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { packApp, stageNodeLayout } from './lib/pack.mjs';

function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cdj-pack-'));
  fs.mkdirSync(path.join(root, 'packages', 'database', 'dist'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'packages', 'database', 'package.json'),
    JSON.stringify({ name: '@coolestprojects/database', main: './dist/index.js' }),
  );
  fs.writeFileSync(path.join(root, 'packages', 'database', 'dist', 'index.js'), 'export {}');

  fs.mkdirSync(path.join(root, 'apps', 'api', 'dist'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'apps', 'api', 'package.json'),
    JSON.stringify({
      name: '@coolestprojects/api',
      dependencies: { helmet: '1.0.0' },
      devDependencies: { jest: '1.0.0' },
    }),
  );
  fs.writeFileSync(path.join(root, 'apps', 'api', 'dist', 'main.js'), 'console.log("api")');
  fs.writeFileSync(path.join(root, 'apps', 'api', 'dist', 'app.module.js'), 'export {}');

  fs.mkdirSync(path.join(root, 'apps', 'admin', 'dist', 'components', 'login'), { recursive: true });
  fs.mkdirSync(path.join(root, 'apps', 'admin', 'src', 'components', 'login'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'apps', 'admin', 'package.json'),
    JSON.stringify({ name: '@coolestprojects/admin', type: 'module', dependencies: {} }),
  );
  fs.writeFileSync(path.join(root, 'apps', 'admin', 'dist', 'index.js'), 'console.log("admin")');
  fs.writeFileSync(
    path.join(root, 'apps', 'admin', 'dist', 'components', 'index.js'),
    'export {}',
  );
  fs.writeFileSync(
    path.join(root, 'apps', 'admin', 'dist', 'components', 'login', 'Login.js'),
    'export default {}',
  );
  fs.writeFileSync(
    path.join(root, 'apps', 'admin', 'src', 'components', 'login', 'Login.tsx'),
    'export default function Login() { return null }',
  );

  fs.mkdirSync(path.join(root, 'apps', 'eventguide'), { recursive: true });
  fs.writeFileSync(path.join(root, 'apps', 'eventguide', 'index.html'), '<h1>guide</h1>');
  fs.writeFileSync(path.join(root, 'apps', 'eventguide', 'package.json'), '{}');

  return root;
}

test('api stage has main.js, database vendor, no .env', () => {
  const root = makeRepo();
  const stageDir = path.join(root, 'stage-api');
  packApp({
    repoRoot: root,
    stageDir,
    skipBuild: true,
    skipNpmInstall: true,
    target: {
      app: 'api',
      kind: 'node',
      workspace: 'apps/api',
      databaseWorkspace: 'packages/database',
      module: 'commonjs',
    },
  });

  assert.equal(fs.existsSync(path.join(stageDir, 'main.js')), true);
  assert.equal(fs.existsSync(path.join(stageDir, '.env')), false);
  assert.equal(
    fs.existsSync(path.join(stageDir, 'vendor', 'database', 'dist', 'index.js')),
    true,
  );
  const pkg = JSON.parse(fs.readFileSync(path.join(stageDir, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['@coolestprojects/database'], 'file:./vendor/database');
  assert.equal(pkg.devDependencies, undefined);
  assert.equal(fs.existsSync(path.join(stageDir, 'sql-views')), true);
  assert.equal(fs.existsSync(path.join(stageDir, 'apply-views.cjs')), true);
  fs.rmSync(root, { recursive: true, force: true });
});

test('admin stage writes ESM main.js wrapper and keeps component sources', () => {
  const root = makeRepo();
  const stageDir = path.join(root, 'stage-admin');
  packApp({
    repoRoot: root,
    stageDir,
    skipBuild: true,
    skipNpmInstall: true,
    target: {
      app: 'admin',
      kind: 'node',
      workspace: 'apps/admin',
      databaseWorkspace: 'packages/database',
      module: 'esm',
    },
  });

  assert.match(fs.readFileSync(path.join(stageDir, 'main.js'), 'utf8'), /import '\.\/index\.js'/);
  assert.equal(fs.existsSync(path.join(stageDir, 'index.js')), true);
  assert.equal(fs.existsSync(path.join(stageDir, 'components', 'index.js')), true);
  assert.equal(fs.existsSync(path.join(stageDir, 'components', 'login', 'Login.tsx')), true);
  assert.equal(fs.existsSync(path.join(stageDir, 'components', 'login', 'Login.js')), false);
  fs.rmSync(root, { recursive: true, force: true });
});

test('eventguide copies html and skips package.json', () => {
  const root = makeRepo();
  const stageDir = path.join(root, 'stage-guide');
  packApp({
    repoRoot: root,
    stageDir,
    skipBuild: true,
    skipNpmInstall: true,
    target: {
      app: 'eventguide',
      kind: 'static',
      workspace: 'apps/eventguide',
      generate: 'copy',
    },
  });
  assert.equal(fs.existsSync(path.join(stageDir, 'index.html')), true);
  assert.equal(fs.existsSync(path.join(stageDir, 'package.json')), false);
  fs.rmSync(root, { recursive: true, force: true });
});

test('stageNodeLayout rejects a dist without main.js', () => {
  const root = makeRepo();
  fs.unlinkSync(path.join(root, 'apps', 'api', 'dist', 'main.js'));
  assert.throws(
    () => stageNodeLayout({
      stageDir: path.join(root, 'bad'),
      distDir: path.join(root, 'apps', 'api', 'dist'),
      packageJson: { dependencies: {} },
      databaseDir: path.join(root, 'packages', 'database'),
      module: 'commonjs',
    }),
    /missing main.js/,
  );
  fs.rmSync(root, { recursive: true, force: true });
});
