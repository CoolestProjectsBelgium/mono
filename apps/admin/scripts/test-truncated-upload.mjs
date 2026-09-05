import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const svg = readFileSync(path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg'), 'utf8');

for (const limit of [100_000, 200_000, 500_000, 1_000_000, svg.length]) {
  const chunk = svg.slice(0, limit);
  const result = processVisioSvg(chunk);
  console.log(limit, {
    tables: result.tableNumbers.length,
    corrupt: isProcessedSvgCorrupt(result.processedSvg),
  });
}
