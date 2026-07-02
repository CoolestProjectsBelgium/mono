import type { WhereOptions } from 'sequelize';

/** Restrict queries to projects that are not soft-deleted. */
export function activeProjectWhere(where: WhereOptions = {}): WhereOptions {
  return { ...where, removedAt: null };
}
