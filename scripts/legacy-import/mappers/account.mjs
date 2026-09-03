import { copyTimestamps } from './helpers.mjs';

export function mapAccount(row) {
  return {
    id: row.id,
    email: row.email,
    account_type: row.account_type,
    encryptedPassword: null,
    ...copyTimestamps(row),
  };
}
