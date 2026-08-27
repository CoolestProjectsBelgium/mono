export type ViaType = 'dojo' | 'other' | null;

export function normalizeAffiliation(
  viaType: string | null | undefined,
  via: string | null | undefined,
): { via_type: ViaType; via: string } {
  const type: ViaType = viaType === 'dojo' || viaType === 'other' ? viaType : null;
  const name = (via ?? '').trim();

  if (!type) {
    return { via_type: null, via: '' };
  }

  if (!name) {
    throw new Error('Validation: affiliation name is required.');
  }

  if (name.length > 255) {
    throw new Error('Validation: affiliation name is too long.');
  }

  return { via_type: type, via: name };
}
