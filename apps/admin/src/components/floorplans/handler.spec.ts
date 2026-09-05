import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('handler proxies floorplan actions through the Nest API', () => {
  const handlerPath = fileURLToPath(new URL('./handler.ts', import.meta.url));
  const source = readFileSync(handlerPath, 'utf8');

  assert.doesNotMatch(source, /from 'node:fs/);
  assert.match(source, /nestFetch\('\/admin\/floorplans'/);
  assert.match(source, /nestFetch\(`\/admin\/floorplans\/\$\{filename\}\/activate`/);
  assert.match(source, /payload\.action === 'upload'/);
});
