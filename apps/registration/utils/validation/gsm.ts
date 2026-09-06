export const BELGIAN_GSM_REGEX = /^((\+|00)32\s?|0)([1-9][0-9]\d{6})\d?$/

/** Strip spaces and common separators so `0470 12 34 56` can be validated and stored. */
export function normalizeGsm(value: string): string {
  return value.replace(/[\s./()-]/g, '')
}

export function isBelgianGsm(value: string): boolean {
  return BELGIAN_GSM_REGEX.test(normalizeGsm(value))
}
