import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');

for (const label of ['original', 'corrupt-on-disk']) {
  const file = label === 'original'
    ? path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg')
    : '/tmp/uploads/floorplans/grondplan-cp-2026-zaal.svg';
  const svg = readFileSync(file, 'utf8');
  const result = processVisioSvg(svg);
  console.log(label, {
    tables: result.tableNumbers.length,
    corrupt: isProcessedSvgCorrupt(result.processedSvg),
    inputCorrupt: isProcessedSvgCorrupt(svg),
  });
}
