import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restartNodeCommand } from './lib/ssh.mjs';

test('restartNodeCommand sends SIGTERM without matching pkill itself', () => {
  const command = restartNodeCommand();
  assert.match(command, /pkill -u "\$\(id -u\)" -f/);
  assert.match(command, /\[n\]ode main\.js/);
  assert.match(command, /\|\| true/);
});
