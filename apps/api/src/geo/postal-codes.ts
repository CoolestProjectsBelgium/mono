import postalCodesData from './be-postal-codes.json';

export interface PostalCodeEntry {
  postalcode: number;
  municipality_nl: string;
  municipality_fr: string;
}

const postalCodes = postalCodesData as PostalCodeEntry[];

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function isValidPostalMunicipalityPair(
  postalcode: number,
  municipalityName: string,
): boolean {
  if (
    !postalcode ||
    postalcode < 1000 ||
    postalcode > 9999 ||
    !municipalityName?.trim()
  ) {
    return false;
  }

  const normalizedName = normalizeSearchText(municipalityName);
  return postalCodes.some((entry) => {
    if (entry.postalcode !== postalcode) {
      return false;
    }
    return (
      normalizeSearchText(entry.municipality_nl) === normalizedName ||
      normalizeSearchText(entry.municipality_fr) === normalizedName
    );
  });
}

export function validateAddress(postalcode: number, municipalityName: string): void {
  if (postalcode < 1000 || postalcode > 9999) {
    throw new Error('Postal code must be a valid Belgian postcode between 1000 and 9999.');
  }

  if (!municipalityName?.trim()) {
    throw new Error('Municipality name is required.');
  }

  if (!isValidPostalMunicipalityPair(postalcode, municipalityName)) {
    throw new Error('Postal code and municipality do not match a valid Belgian location.');
  }
}
