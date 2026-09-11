import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('handler reads slide configs directly and proxies deck rendering through the Nest API', () => {
  const handlerPath = fileURLToPath(new URL('./handler.ts', import.meta.url));
  const source = readFileSync(handlerPath, 'utf8');

  assert.match(source, /PresentationSlide\.findAll/);
  assert.match(source, /api\.get<\{/);
  assert.match(source, /'\/admin\/presentation-slides\/preview'/);
  assert.match(source, /action === 'load-projects'/);
  assert.match(source, /'\/admin\/presentation-slides\/preview\/projects'/);
  assert.match(source, /action === 'preview'/);
  assert.match(source, /api\.post<\{\s*imageBase64: string\s*\}>/);
  assert.match(source, /'\/admin\/presentation-slides\/preview\/draft'/);
});
