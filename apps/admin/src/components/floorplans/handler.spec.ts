import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeFloorplanFilename } from './floorplan-path.js';
import { processVisioSvg, isProcessedSvgCorrupt } from './process-visio-svg.js';

const mapsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../../maps',
);

describe('floorplan-path', () => {
  it('rejects unsafe filenames', () => {
    assert.equal(sanitizeFloorplanFilename('../secret.svg'), null);
    assert.equal(sanitizeFloorplanFilename('map.png'), null);
    assert.equal(sanitizeFloorplanFilename('cp2025_zaal.svg'), 'cp2025_zaal.svg');
  });
});

describe('processVisioSvg', () => {
  it('assigns table_XX ids and blink CSS to Visio exports', () => {
    const fixturePath = path.join(mapsDir, 'Grondplan CP 2024.svg');
    const svg = readFileSync(fixturePath, 'utf8');
    const result = processVisioSvg(svg);

    assert.ok(result.tableNumbers.length > 0);
    assert.ok(result.processedSvg.includes('id="table_'));
    assert.ok(result.processedSvg.includes('table-blink'));
  });

  it('processes a minimal Tafel group fixture', () => {
    const svg = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g id="group1">
          <title>Tafel.1</title>
          <text>26.</text>
        </g>
      </svg>
    `;

    const result = processVisioSvg(svg);
    assert.deepEqual(result.tableNumbers, [26]);
    assert.match(result.processedSvg, /id="table_26"/);
  });

  it('does not corrupt Visio exports when injecting blink CSS', () => {
    const fixturePath = path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg');
    const svg = readFileSync(fixturePath, 'utf8');
    const result = processVisioSvg(svg);

    assert.ok(result.tableNumbers.length > 0);
    assert.equal(isProcessedSvgCorrupt(result.processedSvg), false);
    assert.doesNotMatch(result.processedSvg, /<text[^>]*<g id="table_/i);
    assert.doesNotMatch(result.processedSvg, /x="-?\d+\.?\d*<g id="table_/i);
  });
});
