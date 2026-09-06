import { normalizeGsm } from './normalize-gsm';

describe('normalizeGsm', () => {
  it('strips spaces and separators', () => {
    expect(normalizeGsm('0470 12 34 56')).toBe('0470123456');
    expect(normalizeGsm('+32 470 12 34 56')).toBe('+32470123456');
    expect(normalizeGsm('')).toBe('');
    expect(normalizeGsm(null)).toBe('');
  });
});
