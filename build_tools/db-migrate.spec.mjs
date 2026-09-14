import assert from 'node:assert/strict';
import { test } from 'node:test';
import { remoteMigrateCommand } from './lib/db-migrate.mjs';

test('remoteMigrateCommand runs db:migrate in remote app dir', () => {
  const command = remoteMigrateCommand({ remotePath: 'app' });
  assert.match(command, /cd 'app' && node dist\/cli db:migrate/);
});

test('remoteMigrateCommand strips a trailing slash from remotePath', () => {
  const command = remoteMigrateCommand({ remotePath: 'app/' });
  assert.match(command, /cd 'app' && node dist\/cli db:migrate/);
});
