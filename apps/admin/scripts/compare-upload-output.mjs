import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const source = readFileSync(path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg'), 'utf8');
const saved = readFileSync('/tmp/uploads/floorplans/grondplan-cp-2026-zaal.svg', 'utf8');
const expected = processVisioSvg(source).processedSvg;

function firstDiff(a, b) {
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      return {
        index: i,
        a: a.slice(Math.max(0, i - 40), i + 80),
        b: b.slice(Math.max(0, i - 40), i + 80),
      };
    }
  }
  return null;
}

const diff = firstDiff(expected, saved);
writeFileSync('/tmp/compare-upload-output.json', JSON.stringify({
  sourceLen: source.length,
  expectedLen: expected.length,
  savedLen: saved.length,
  sameAsExpected: expected === saved,
  expectedCorrupt: isProcessedSvgCorrupt(expected),
  savedCorrupt: isProcessedSvgCorrupt(saved),
  firstDiff: diff,
}, null, 2));

console.log(JSON.stringify({
  sameAsExpected: expected === saved,
  expectedCorrupt: isProcessedSvgCorrupt(expected),
  savedCorrupt: isProcessedSvgCorrupt(saved),
  firstDiffIndex: diff?.index ?? null,
}, null, 2));
