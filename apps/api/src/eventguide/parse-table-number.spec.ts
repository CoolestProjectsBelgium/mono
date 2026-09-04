import { parseTableNumber } from './parse-table-number';

describe('parseTableNumber', () => {
  it('parses Tafel_XX names from the seeder', () => {
    expect(parseTableNumber('Tafel_01')).toBe(1);
    expect(parseTableNumber('Tafel_26')).toBe(26);
    expect(parseTableNumber('Tafel_36')).toBe(36);
  });

  it('parses legacy "Tafel 12" style names', () => {
    expect(parseTableNumber('Tafel 12')).toBe(12);
  });

  it('returns null for empty or unparseable names', () => {
    expect(parseTableNumber(null)).toBeNull();
    expect(parseTableNumber('')).toBeNull();
    expect(parseTableNumber('Stage')).toBeNull();
  });
});
