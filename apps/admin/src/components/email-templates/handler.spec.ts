import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('handler fetches mail context through the Nest API instead of building it locally', () => {
  const handlerPath = fileURLToPath(new URL('./handler.ts', import.meta.url));
  const source = readFileSync(handlerPath, 'utf8');

  assert.match(source, /api\.post<Record<string, unknown>>/);
  assert.match(source, /'\/admin\/mail-templates\/context'/);
  assert.match(source, /action === 'load-context'/);
  assert.match(source, /action === 'preview'/);
  assert.doesNotMatch(source, /buildPreviewContext/);
  assert.doesNotMatch(source, /buildDummyContext/);
});
