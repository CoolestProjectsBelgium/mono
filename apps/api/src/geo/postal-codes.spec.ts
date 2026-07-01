import { isValidPostalMunicipalityPair, validateAddress } from './postal-codes';

describe('postal-codes', () => {
  describe('isValidPostalMunicipalityPair', () => {
    it('accepts valid Belgian postal and municipality pairs', () => {
      expect(isValidPostalMunicipalityPair(2800, 'Mechelen')).toBe(true);
      expect(isValidPostalMunicipalityPair(2800, 'Malines')).toBe(true);
    });

    it('rejects invalid pairs', () => {
      expect(isValidPostalMunicipalityPair(2800, 'Antwerpen')).toBe(false);
      expect(isValidPostalMunicipalityPair(0, 'Mechelen')).toBe(false);
      expect(isValidPostalMunicipalityPair(2800, '')).toBe(false);
    });
  });

  describe('validateAddress', () => {
    it('throws for invalid postal code range', () => {
      expect(() => validateAddress(0, 'Mechelen')).toThrow(
        'Postal code must be a valid Belgian postcode between 1000 and 9999.',
      );
    });

    it('throws for empty municipality', () => {
      expect(() => validateAddress(2800, '')).toThrow(
        'Municipality name is required.',
      );
    });

    it('throws for mismatched postal and municipality', () => {
      expect(() => validateAddress(2800, 'Antwerpen')).toThrow(
        'Postal code and municipality do not match a valid Belgian location.',
      );
    });
  });
});
