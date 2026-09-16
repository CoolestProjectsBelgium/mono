import { Municipality } from '@coolestprojects/database';

/**
 * Confirms a postal code matches a known municipality for the event —
 * mirrors resolveAffiliation's shape (apps/api/src/affiliation/resolve-affiliation.ts):
 * same "Validation: ..." error convention (registration.controller.ts's
 * error-message routing already treats any error containing "Validation" as
 * a 400, not a 500), same event-scoped DB lookup instead of trusting the
 * client.
 */
export async function resolveMunicipality(
  municipalityModel: typeof Municipality,
  eventId: number,
  postalcode: number,
): Promise<void> {
  const found = await municipalityModel.findOne({
    where: { eventId, postalcode },
  });
  if (!found) {
    throw new Error(
      `Validation: postal code ${postalcode} does not match a known municipality.`,
    );
  }
}
