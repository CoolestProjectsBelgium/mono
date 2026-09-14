import type { QueryInterface } from 'sequelize';

// Marks the schema produced by years of sync({ alter: true }) as the
// starting point for migration history. Existing tables/columns are already
// there, so this intentionally does nothing — safe to run once against any
// existing dev/test/prod database. Every schema change from this point on
// ships as a new migration alongside its model change, instead of relying on
// sync() to apply it.
//
// Umzug calls each migration's up/down with { context, name, path } — context
// is the QueryInterface passed to `new Umzug({ context: ... })` (see
// apps/api/src/cli/migrate.command.ts), not a bare first argument.
export const up = async ({
  context: _queryInterface,
}: {
  context: QueryInterface;
}): Promise<void> => {};

export const down = async ({
  context: _queryInterface,
}: {
  context: QueryInterface;
}): Promise<void> => {};
