import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const uploadRoot = process.env.UPLOAD_ROOT ?? '/tmp/uploads';
const floorplanDir = path.join(uploadRoot, 'floorplans');
const sourcePath = path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg');
const targetName = 'grondplan-cp-2026-zaal.svg';
const targetPath = path.join(floorplanDir, targetName);

const svgContent = readFileSync(sourcePath, 'utf8');

if (isProcessedSvgCorrupt(svgContent)) {
  throw new Error('Input SVG is already corrupt');
}

const processed = processVisioSvg(svgContent);
if (processed.tableNumbers.length === 0) {
  throw new Error('No tables detected');
}
if (isProcessedSvgCorrupt(processed.processedSvg)) {
  throw new Error('Processed SVG is corrupt');
}

mkdirSync(floorplanDir, { recursive: true });
writeFileSync(targetPath, processed.processedSvg, 'utf8');

console.log(JSON.stringify({
  sourceSize: svgContent.length,
  outputSize: processed.processedSvg.length,
  tables: processed.tableNumbers.length,
  corrupt: isProcessedSvgCorrupt(processed.processedSvg),
  targetPath,
  warnings: processed.warnings.length,
}, null, 2));
