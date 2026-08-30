import { Affiliation } from '@coolestprojects/database';
import { resolveAffiliation } from './resolve-affiliation';

describe('resolveAffiliation', () => {
  const findOne = jest.fn();
  const affiliationModel = { findOne } as unknown as typeof Affiliation;

  beforeEach(() => {
    findOne.mockReset();
  });

  it('does not query dojos when affiliation is skipped', async () => {
    await expect(
      resolveAffiliation(affiliationModel, 1, '', 'Dojo Balen'),
    ).resolves.toEqual({ via_type: null, via: '' });
    expect(findOne).not.toHaveBeenCalled();
  });

  it('accepts a known dojo and stores the catalog name', async () => {
    findOne.mockResolvedValue({ name: 'Balen' });

    await expect(
      resolveAffiliation(affiliationModel, 1, 'dojo', '  Dojo Balen  '),
    ).resolves.toEqual({ via_type: 'dojo', via: 'Balen' });
    expect(findOne).toHaveBeenCalledWith({
      where: { eventId: 1, name: 'Balen' },
    });
  });

  it('rejects an unknown dojo', async () => {
    findOne.mockResolvedValue(null);

    await expect(
      resolveAffiliation(affiliationModel, 1, 'dojo', 'Not a Dojo'),
    ).rejects.toThrow('Validation: unknown affiliation dojo.');
  });
});
