import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processVisioSvg, isProcessedSvgCorrupt } from '../src/components/floorplans/process-visio-svg.ts';

const mapsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../maps');
const source = readFileSync(path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg'), 'utf8');

function decodeLikeFormBody(body) {
  const params = new URLSearchParams(body);
  return params.get('svgContent') ?? '';
}

const body = new URLSearchParams({
  action: 'upload',
  originalName: 'Grondplan CP 2026_Zaal.svg',
  svgContent: source,
}).toString();

const decoded = decodeLikeFormBody(body);
const direct = processVisioSvg(source);
const afterForm = processVisioSvg(decoded);

console.log(JSON.stringify({
  sourceLen: source.length,
  decodedLen: decoded.length,
  sameAsSource: decoded === source,
  directCorrupt: isProcessedSvgCorrupt(direct.processedSvg),
  afterFormCorrupt: isProcessedSvgCorrupt(afterForm.processedSvg),
  firstDiff: decoded === source ? null : (() => {
    for (let i = 0; i < Math.max(source.length, decoded.length); i++) {
      if (source[i] !== decoded[i]) {
        return { index: i, source: source.slice(i, i + 40), decoded: decoded.slice(i, i + 40) };
      }
    }
    return 'length-mismatch';
  })(),
}, null, 2));
