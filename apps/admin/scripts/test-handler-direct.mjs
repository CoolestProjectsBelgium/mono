import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Handler } from '../src/components/floorplans/handler.ts';
import { isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const source = readFileSync(path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg'), 'utf8');
const targetPath = '/tmp/uploads/floorplans/grondplan-cp-2026-zaal.svg';

await Handler(
  { method: 'post', payload: { action: 'upload', svgContent: source, originalName: 'Grondplan CP 2026_Zaal.svg' } },
  {},
  { currentAdmin: { eventId: 1 } },
);

const saved = readFileSync(targetPath, 'utf8');
console.log(JSON.stringify({
  savedLen: saved.length,
  corrupt: isProcessedSvgCorrupt(saved),
}, null, 2));
