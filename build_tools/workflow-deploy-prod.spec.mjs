import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { REPO_ROOT } from './lib/targets.mjs';

const workflowPath = path.join(REPO_ROOT, '.github', 'workflows', 'deploy-prod.yml');

test('deploy-prod workflow contract', () => {
  const yaml = fs.readFileSync(workflowPath, 'utf8');
  assert.match(yaml, /branches:\s*\n\s*-\s*main/);
  assert.match(yaml, /environment:\s*production/);
  assert.match(yaml, /node-version:\s*['"]24['"]/);
  assert.match(yaml, /deploy-all\.mjs --env prod/);
  assert.doesNotMatch(yaml, /--env dev/);
  assert.match(yaml, /workflow_dispatch/);
  assert.match(yaml, /group:\s*deploy-prod/);
  assert.match(yaml, /cancel-in-progress:\s*false/);
  assert.match(yaml, /secrets\.L27_SSH_PRIVATE_KEY/);
  assert.match(yaml, /vars\.L27_SSH_HOST/);
});
