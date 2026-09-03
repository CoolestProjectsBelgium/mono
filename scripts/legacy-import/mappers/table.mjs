import { copyTimestamps, eventIdOf, projectIdOf } from './helpers.mjs';

export function mapAssignedTables(projectTables = [], tables = []) {
  const byId = new Map(tables.map((table) => [table.id, table]));
  const seen = new Set();
  const rows = [];
  for (const assignment of projectTables) {
    const tableId = assignment.TableId ?? assignment.tableId;
    const table = byId.get(tableId);
    const projectId = projectIdOf(assignment);
    if (!table || projectId == null) continue;
    if (seen.has(table.id)) continue;
    seen.add(table.id);
    rows.push({
      id: table.id,
      eventId: eventIdOf(assignment) ?? eventIdOf(table),
      projectId,
      name: table.name,
      maxPlaces: table.maxPlaces,
      requirements: table.requirements ?? null,
      ...copyTimestamps(table),
    });
  }
  return rows;
}
