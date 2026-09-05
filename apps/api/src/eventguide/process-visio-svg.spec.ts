import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import {
  isProcessedSvgCorrupt,
  processVisioSvg,
} from './process-visio-svg';

const mapsDir = path.join(__dirname, '../../../../maps');

describe('processVisioSvg', () => {
  it('assigns table_XX ids and blink CSS to Visio exports', () => {
    const fixturePath = path.join(mapsDir, 'Grondplan CP 2024.svg');
    const svg = readFileSync(fixturePath, 'utf8');
    const result = processVisioSvg(svg);

    expect(result.tableNumbers.length).toBeGreaterThan(0);
    expect(result.processedSvg).toContain('id="table_');
    expect(result.processedSvg).toContain('table-blink');
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
    expect(result.tableNumbers).toEqual([26]);
    expect(result.processedSvg).toMatch(/id="table_26"/);
  });

  it('does not corrupt Visio exports when injecting blink CSS', () => {
    const fixturePath = path.join(mapsDir, 'Grondplan CP 2026_Zaal.svg');
    const svg = readFileSync(fixturePath, 'utf8');
    const result = processVisioSvg(svg);

    expect(result.tableNumbers.length).toBeGreaterThan(0);
    expect(isProcessedSvgCorrupt(result.processedSvg)).toBe(false);
    expect(result.processedSvg).not.toMatch(/<text[^>]*<g id="table_/i);
    expect(result.processedSvg).not.toMatch(/x="-?\d+\.?\d*<g id="table_/i);
  });
});
