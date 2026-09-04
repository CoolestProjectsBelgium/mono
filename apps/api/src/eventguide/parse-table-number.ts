/**
 * Parse a table number from EventTable.name (e.g. "Tafel_26" → 26).
 */
export function parseTableNumber(name: string | null | undefined): number | null {
  if (!name) {
    return null;
  }

  const match = name.match(/(\d+)\s*$/);
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}
