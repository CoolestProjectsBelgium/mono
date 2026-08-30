import fs from 'node:fs';
import path from 'node:path';
import { run } from './run.mjs';

const BUNDLE_SCRIPT_NAME = '.bundle-adminjs.mjs';

const BUNDLE_SCRIPT = `import AdminJS from 'adminjs'
import importExportFeature from '@adminjs/import-export'
import passwordsFeature from '@adminjs/passwords'
import { componentLoader } from './components/loader.js'

passwordsFeature({
  componentLoader,
  hash: async (value) => value,
})
importExportFeature({ componentLoader })

const admin = new AdminJS({ componentLoader })
await admin.initialize()
`;

/**
 * Build custom AdminJS components once on Linux pack, then copy
 * `.adminjs/bundle.js` to `frontend/assets/components.bundle.js` so dest
 * can serve it with express.static (no Rollup at boot).
 *
 * @param {{ stageDir: string, runImpl?: typeof run }} input
 */
export function bundleAdminComponents(input) {
  const runImpl = input.runImpl ?? run;
  const scriptPath = path.join(input.stageDir, BUNDLE_SCRIPT_NAME);
  fs.writeFileSync(scriptPath, BUNDLE_SCRIPT);
  try {
    runImpl('node', [scriptPath], {
      cwd: input.stageDir,
      stdio: 'inherit',
      env: { NODE_ENV: 'production' },
    });
  } finally {
    fs.rmSync(scriptPath, { force: true });
  }

  const bundlePath = path.join(input.stageDir, '.adminjs', 'bundle.js');
  if (!fs.existsSync(bundlePath)) {
    throw new Error(`AdminJS production bundle was not created (${bundlePath})`);
  }

  const assetsDir = path.join(input.stageDir, 'frontend', 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  const assetPath = path.join(assetsDir, 'components.bundle.js');
  fs.copyFileSync(bundlePath, assetPath);
  return assetPath;
}
