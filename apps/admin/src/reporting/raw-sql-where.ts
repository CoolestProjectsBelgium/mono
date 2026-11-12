interface FilterElement {
  path: string;
  value: string | { from?: string; to?: string };
}

/**
 * Turns an AdminJS filter into a parameterised WHERE clause for a report.
 *
 * Values always travel as named replacements. Column names cannot be
 * parameterised, so only paths listed in `allowedColumns` (the report's own
 * column list) are used — the filter keys come straight from the request's
 * query string and anything else is ignored.
 */
export const buildWhere = (
  filter: unknown,
  baseReplacements: Record<string, unknown>,
  allowedColumns: ReadonlySet<string>,
) => {
  const clauses: string[] = [];
  const replacements: Record<string, unknown> = { ...baseReplacements };
  const elements = Object.values(
    (filter as { filters?: Record<string, FilterElement> })?.filters ?? {},
  );

  elements.forEach((element, index) => {
    if (!allowedColumns.has(element.path)) {
      return;
    }
    const column = `\`${element.path}\``;
    const { value } = element;

    if (value && typeof value === 'object') {
      if (value.from) {
        const key = `f${index}_from`;
        clauses.push(`${column} >= :${key}`);
        replacements[key] = value.from;
      }
      if (value.to) {
        const key = `f${index}_to`;
        clauses.push(`${column} <= :${key}`);
        replacements[key] = value.to;
      }
    } else if (value !== undefined && value !== '') {
      const key = `f${index}`;
      clauses.push(`${column} = :${key}`);
      replacements[key] = value;
    }
  });

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    replacements,
  };
};
