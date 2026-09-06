export function normalizeGsm(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value.replace(/[\s./()-]/g, '');
}
