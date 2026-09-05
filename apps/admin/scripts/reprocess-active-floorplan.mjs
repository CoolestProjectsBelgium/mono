import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const uploadRoot = process.env.UPLOAD_ROOT ?? '/tmp/uploads';
const targetPath = path.join(uploadRoot, 'floorplans', 'grondplan-cp-2026-zaal.svg');

const svg = readFileSync(path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg'), 'utf8');
const result = processVisioSvg(svg);

if (isProcessedSvgCorrupt(result.processedSvg)) {
  throw new Error('Processed floor plan SVG is corrupt');
}

writeFileSync(targetPath, result.processedSvg, 'utf8');
console.log(`Wrote ${targetPath} (${result.tableNumbers.length} tables)`);
