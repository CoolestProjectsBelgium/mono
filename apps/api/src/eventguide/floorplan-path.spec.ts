import {
  sanitizeFloorplanFilename,
  toFloorplanApiPath,
} from './floorplan-path';

describe('floorplan-path', () => {
  describe('sanitizeFloorplanFilename', () => {
    it('accepts a simple svg filename', () => {
      expect(sanitizeFloorplanFilename('cp2025_zaal.svg')).toBe('cp2025_zaal.svg');
    });

    it('strips directory segments', () => {
      expect(sanitizeFloorplanFilename('../../etc/passwd.svg')).toBeNull();
    });

    it('rejects path traversal in basename', () => {
      expect(sanitizeFloorplanFilename('..svg')).toBeNull();
    });

    it('rejects non-svg extensions', () => {
      expect(sanitizeFloorplanFilename('map.png')).toBeNull();
    });
  });

  describe('toFloorplanApiPath', () => {
    it('prefixes bare filenames', () => {
      expect(toFloorplanApiPath('cp2025_zaal.svg')).toBe(
        'eventguide/floorplans/cp2025_zaal.svg',
      );
    });

    it('leaves already-prefixed paths unchanged', () => {
      expect(toFloorplanApiPath('eventguide/floorplans/cp2025_zaal.svg')).toBe(
        'eventguide/floorplans/cp2025_zaal.svg',
      );
    });
  });
});
