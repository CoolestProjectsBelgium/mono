import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { REPO_ROOT } from './lib/targets.mjs';

const workflowPath = path.join(REPO_ROOT, '.github', 'workflows', 'deploy-test.yml');

test('deploy-test workflow contract', () => {
  const yaml = fs.readFileSync(workflowPath, 'utf8');
  assert.match(yaml, /branches:\s*\n\s*-\s*test-env/);
  assert.doesNotMatch(yaml, /^\s*environment:/m);
  assert.match(yaml, /node-version:\s*['"]24['"]/);
  assert.match(yaml, /deploy-all\.mjs --env dev/);
  assert.doesNotMatch(yaml, /--env prod/);
  assert.match(yaml, /workflow_dispatch/);
  assert.match(yaml, /group:\s*deploy-test/);
  assert.match(yaml, /cancel-in-progress:\s*false/);
  assert.match(yaml, /secrets\.L27_SSH_PRIVATE_KEY/);
  assert.match(yaml, /vars\.L27_SSH_HOST/);
});
