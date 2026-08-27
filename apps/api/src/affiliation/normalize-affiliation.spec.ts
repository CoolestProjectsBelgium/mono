import { normalizeAffiliation } from './normalize-affiliation';

describe('normalizeAffiliation', () => {
  it('treats missing type as skipped', () => {
    expect(normalizeAffiliation('', 'Dojo Balen')).toEqual({
      via_type: null,
      via: '',
    });
  });

  it('keeps dojo name when type is set', () => {
    expect(normalizeAffiliation('dojo', '  Dojo Balen  ')).toEqual({
      via_type: 'dojo',
      via: 'Dojo Balen',
    });
  });

  it('requires a name when type is set', () => {
    expect(() => normalizeAffiliation('other', '  ')).toThrow(
      'Validation: affiliation name is required.',
    );
  });
});
