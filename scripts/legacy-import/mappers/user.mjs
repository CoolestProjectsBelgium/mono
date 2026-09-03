import { copyTimestamps, emptyToNull, eventIdOf } from './helpers.mjs';

export function mapUser(row) {
  const via = emptyToNull(row.via);
  return {
    id: row.id,
    eventId: eventIdOf(row),
    tshirtId: row.sizeId ?? row.tshirtId ?? null,
    language: row.language,
    postalcode: row.postalcode,
    municipality_name: row.municipality_name,
    email: row.email,
    firstname: row.firstname,
    lastname: row.lastname,
    sex: row.sex,
    birthmonth: row.birthmonth,
    last_token: row.last_token,
    via,
    via_type: via ? 'other' : null,
    medical: row.medical,
    gsm: row.gsm,
    gsm_guardian: row.gsm_guardian,
    internalinfo: row.internalinfo,
    email_guardian: row.email_guardian,
    ...copyTimestamps(row),
  };
}
