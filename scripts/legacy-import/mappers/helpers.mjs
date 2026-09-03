export function eventIdOf(row) {
  return row.eventId ?? row.EventId ?? null;
}

export function projectIdOf(row) {
  return row.projectId ?? row.ProjectId ?? null;
}

export function emptyToNull(value) {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length === 0 ? null : text;
}

export function asString(value) {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

export function nullableUserId(value) {
  if (value == null || value === '' || value === 0 || value === '0') return null;
  return Number(value);
}

export function copyTimestamps(row) {
  const out = {};
  if (row.createdAt != null) out.createdAt = row.createdAt;
  if (row.updatedAt != null) out.updatedAt = row.updatedAt;
  return out;
}
