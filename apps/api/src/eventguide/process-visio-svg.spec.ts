import { processVisioSvg } from './process-visio-svg';

describe('processVisioSvg', () => {
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
});
