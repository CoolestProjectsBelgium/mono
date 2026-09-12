import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('handler proxies floorplan actions through the Nest API', () => {
  const handlerPath = fileURLToPath(new URL('./handler.ts', import.meta.url));
  const source = readFileSync(handlerPath, 'utf8');

  assert.match(source, /api\.get<FloorplansOverview>\('\/admin\/floorplans'\)/);
  assert.match(source, /api\.post<FloorplansOverview>/);
  assert.match(source, /`\/admin\/floorplans\/\$\{filename\}\/activate`/);
  assert.match(source, /payload\.action === 'delete'/);
  assert.match(
    source,
    /api\.delete<FloorplansOverview>\(`\/admin\/floorplans\/\$\{filename\}`\)/,
  );
  // Upload re-encodes the formidable-parsed file (payload.file) into a real
  // multipart request via NestApiClient.postForm, reaching Nest's
  // FileInterceptor route the same way every other upload in this codebase does.
  assert.match(source, /payload\.action === 'upload'/);
  assert.match(
    source,
    /api\.postForm<FloorplansOverview>\(\s*'\/admin\/floorplans'/,
  );
});
