import { resolveMunicipality } from './resolve-municipality';

describe('resolveMunicipality', () => {
  it('resolves when the postal code is known for the event', async () => {
    const findOne = vi.fn().mockResolvedValue({ id: 1 });
    await expect(
      resolveMunicipality({ findOne } as never, 4, 9000),
    ).resolves.toBeUndefined();
    expect(findOne).toHaveBeenCalledWith({
      where: { eventId: 4, postalcode: 9000 },
    });
  });

  it('throws a "Validation:" error for an unknown postal code', async () => {
    const findOne = vi.fn().mockResolvedValue(null);
    await expect(
      resolveMunicipality({ findOne } as never, 4, 1234),
    ).rejects.toThrow(
      'Validation: postal code 1234 does not match a known municipality.',
    );
  });
});
