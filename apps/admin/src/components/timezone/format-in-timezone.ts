// timezone comes from currentAdmin (see TimezoneDateShow/List and
// components/login/authenticate.ts) — resolved server-side at login from
// the DISPLAY_TIMEZONE env var (see display-timezone.ts), the same one
// apps/api's mail-context.ts reads, so the same instant reads identically
// in AdminJS and wherever apps/api renders one. The zone is shown alongside
// the value so it's never ambiguous. The underlying column stays UTC in the
// database; this only affects display.
export function formatInTimezone(
  rawValue: unknown,
  timezone: string | undefined,
): string {
  if (!rawValue) {
    return '—';
  }
  const date = new Date(rawValue as string);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const formatted = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(date);
  return `${formatted} (${timezone})`;
}
