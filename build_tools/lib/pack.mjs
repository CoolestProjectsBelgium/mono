import fs from 'node:fs';
import path from 'node:path';
import { bundleAdminComponents } from './admin-bundle.mjs';
import { run } from './run.mjs';
import { stageSqlViews } from './sql-views.mjs';

/**
 * @param {string} from
 * @param {string} to
 */
export function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true, force: true });
}

/**
 * Copy files into an existing tree without replacing directories wholesale.
 * @param {string} from
 * @param {string} to
 */
export function mergeCopy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      mergeCopy(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

/**
 * @param {string} dir
 * @param {string[]} names
 */
export function pathExistsAny(dir, names) {
  for (const name of names) {
    const candidate = path.join(dir, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Stage a Node app so Level27 can run `node main.js` from `app/`.
 *
 * @param {{
 *   stageDir: string,
 *   distDir: string,
 *   packageJson: object,
 *   databaseDir: string,
 *   module: 'commonjs' | 'esm',
 *   extraDirs?: { from: string, to: string }[],
 * }} input
 */
export function stageNodeLayout(input) {
  fs.rmSync(input.stageDir, { recursive: true, force: true });
  fs.mkdirSync(input.stageDir, { recursive: true });
  copyDir(input.distDir, input.stageDir);

  if (input.module === 'esm' && !fs.existsSync(path.join(input.stageDir, 'main.js'))) {
    fs.writeFileSync(path.join(input.stageDir, 'main.js'), "import './index.js';\n");
  }

  if (!fs.existsSync(path.join(input.stageDir, 'main.js'))) {
    throw new Error(`Staged API/admin payload is missing main.js (looked in ${input.distDir})`);
  }

  const vendorDb = path.join(input.stageDir, 'vendor', 'database');
  fs.mkdirSync(vendorDb, { recursive: true });
  fs.copyFileSync(
    path.join(input.databaseDir, 'package.json'),
    path.join(vendorDb, 'package.json'),
  );
  const dbDist = path.join(input.databaseDir, 'dist');
  if (!fs.existsSync(dbDist)) {
    throw new Error(`Database dist is missing: ${dbDist}`);
  }
  copyDir(dbDist, path.join(vendorDb, 'dist'));

  for (const extra of input.extraDirs ?? []) {
    mergeCopy(extra.from, path.join(input.stageDir, extra.to));
  }

  const stagedPkg = {
    ...input.packageJson,
    dependencies: {
      ...input.packageJson.dependencies,
      '@coolestprojects/database': 'file:./vendor/database',
    },
  };
  delete stagedPkg.devDependencies;
  delete stagedPkg.scripts;
  fs.writeFileSync(
    path.join(input.stageDir, 'package.json'),
    `${JSON.stringify(stagedPkg, null, 2)}\n`,
  );
}

/**
 * @param {{ sourceDir: string, stageDir: string, exclude?: string[] }} input
 */
export function stageStaticLayout(input) {
  fs.rmSync(input.stageDir, { recursive: true, force: true });
  fs.mkdirSync(input.stageDir, { recursive: true });
  fs.cpSync(input.sourceDir, input.stageDir, {
    recursive: true,
    force: true,
    filter: (src) => {
      const base = path.basename(src);
      return !(input.exclude ?? ['node_modules', '.nuxt', '.output']).includes(base);
    },
  });
}

/**
 * @param {{
 *   repoRoot: string,
 *   workspace: string,
 *   skipBuild?: boolean,
 *   runImpl?: typeof run,
 * }} input
 */
export function buildWorkspace(input) {
  if (input.skipBuild) {
    return;
  }
  const runImpl = input.runImpl ?? run;
  runImpl('npm', ['run', 'build', `--workspace=${input.workspace}`], {
    cwd: input.repoRoot,
    stdio: 'inherit',
  });
}

/**
 * AdminJS Rollup resolves `Login` to `.js` before `.tsx`. Dist compiled
 * React files would be bundled instead of the sources dest initialize() needs.
 * @param {string} stageDir
 */
export function stripCompiledAdminComponents(stageDir) {
  const files = [
    ['login', 'Login'],
    ['dashboard', 'Dashboard'],
    ['pictures', 'PictureSelector'],
    ['voting', 'Voting'],
    ['tables', 'Tables'],
  ];
  for (const [dir, name] of files) {
    for (const ext of ['.js', '.d.ts', '.js.map']) {
      fs.rmSync(path.join(stageDir, 'components', dir, `${name}${ext}`), { force: true });
    }
  }
}

/**
 * @param {{
 *   repoRoot: string,
 *   target: object,
 *   stageDir: string,
 *   skipBuild?: boolean,
 *   skipNpmInstall?: boolean,
 *   runImpl?: typeof run,
 * }} input
 */
export function packApp(input) {
  const { repoRoot, target, stageDir } = input;
  const runImpl = input.runImpl ?? run;
  const workspaceDir = path.join(repoRoot, target.workspace);

  if (target.kind === 'node') {
    if (target.databaseWorkspace) {
      buildWorkspace({
        repoRoot,
        workspace: target.databaseWorkspace,
        skipBuild: input.skipBuild,
        runImpl,
      });
    }
    buildWorkspace({
      repoRoot,
      workspace: target.workspace,
      skipBuild: input.skipBuild,
      runImpl,
    });

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(workspaceDir, 'package.json'), 'utf8'),
    );
    const extraDirs = [];
    const componentsSrc = path.join(workspaceDir, 'src', 'components');
    if (fs.existsSync(componentsSrc)) {
      extraDirs.push({ from: componentsSrc, to: 'components' });
    }

    stageNodeLayout({
      stageDir,
      distDir: path.join(workspaceDir, 'dist'),
      packageJson,
      databaseDir: path.join(repoRoot, target.databaseWorkspace),
      module: target.module,
      extraDirs,
    });

    if (target.app === 'admin') {
      stripCompiledAdminComponents(stageDir);
    }

    if (target.app === 'api') {
      stageSqlViews({ repoRoot, stageDir });
    }

    if (!input.skipNpmInstall) {
      runImpl('npm', ['install', '--omit=dev'], {
        cwd: stageDir,
        stdio: 'inherit',
        env: { PUPPETEER_SKIP_DOWNLOAD: '1' },
      });
    }

    if (target.app === 'admin' && !input.skipNpmInstall) {
      bundleAdminComponents({ stageDir, runImpl });
    }
    return stageDir;
  }

  if (target.kind === 'static') {
    if (target.generate === 'nuxt' && !input.skipBuild) {
      runImpl('npm', ['run', 'generate', `--workspace=${target.workspace}`], {
        cwd: repoRoot,
        stdio: 'inherit',
        env: target.generateEnv,
      });
    }

    const generated = pathExistsAny(workspaceDir, ['.output/public', 'dist']);
    const sourceDir =
      target.generate === 'copy'
        ? workspaceDir
        : generated ?? workspaceDir;

    if (target.generate === 'nuxt' && !generated && input.skipBuild) {
      stageStaticLayout({ sourceDir: workspaceDir, stageDir });
      return stageDir;
    }

    if (target.generate === 'nuxt' && !generated) {
      throw new Error(`Nuxt generate output not found under ${workspaceDir}`);
    }

    const exclude = ['node_modules', '.nuxt', '.output', 'dist'];
    if (target.generate === 'copy') {
      if (target.app === 'cdj-web-int') {
        assertCdjWebIntImagesPresent(workspaceDir);
      }
      stageStaticLayout({
        sourceDir,
        stageDir,
        exclude: [...exclude, 'package.json', 'package-lock.json'],
      });
    } else {
      fs.rmSync(stageDir, { recursive: true, force: true });
      fs.mkdirSync(stageDir, { recursive: true });
      copyDir(sourceDir, stageDir);
    }
    return stageDir;
  }

  throw new Error(`Unsupported kind ${target.kind}`);
}

/**
 * @param {string} workspaceDir
 */
export function assertCdjWebIntImagesPresent(workspaceDir) {
  const imagesDir = path.join(workspaceDir, 'images');
  if (!fs.existsSync(imagesDir)) {
    throw new Error('apps/cdj-web-int/images/ is missing. Run `npm run archive-cpbe` first.');
  }
  const entries = fs.readdirSync(imagesDir, { withFileTypes: true });
  const hasFiles = entries.some((entry) => {
    if (entry.isFile()) {
      return true;
    }
    if (entry.isDirectory()) {
      const nested = fs.readdirSync(path.join(imagesDir, entry.name));
      return nested.length > 0;
    }
    return false;
  });
  if (!hasFiles) {
    throw new Error('apps/cdj-web-int/images/ is empty. Run `npm run archive-cpbe` first.');
  }
}
