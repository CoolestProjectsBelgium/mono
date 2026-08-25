import { parseCorsOrigins } from './bootstrap-security';

describe('bootstrap-security', () => {
  it('parseCorsOrigins splits comma-separated origins', () => {
    expect(parseCorsOrigins('https://a.test, https://b.test')).toEqual([
      'https://a.test',
      'https://b.test',
    ]);
  });

  it('parseCorsOrigins ignores empty values', () => {
    expect(parseCorsOrigins('')).toEqual([]);
  });
});
