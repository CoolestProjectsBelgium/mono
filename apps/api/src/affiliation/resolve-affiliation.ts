import { Affiliation } from '@coolestprojects/database';
import { normalizeAffiliation, ViaType } from './normalize-affiliation';

export function stripDojoPrefix(name: string): string {
  return name.replace(/^dojo\s+/i, '').trim();
}

export async function resolveAffiliation(
  affiliationModel: typeof Affiliation,
  eventId: number,
  viaType: string | null | undefined,
  via: string | null | undefined,
): Promise<{ via_type: ViaType; via: string }> {
  const affiliation = normalizeAffiliation(viaType, via);
  if (affiliation.via_type !== 'dojo') {
    return affiliation;
  }

  const name = stripDojoPrefix(affiliation.via);
  const found = await affiliationModel.findOne({
    where: { eventId, name },
  });
  if (!found) {
    throw new Error('Validation: unknown affiliation dojo.');
  }

  return { via_type: 'dojo', via: found.name };
}
