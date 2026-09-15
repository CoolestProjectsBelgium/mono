// DISPLAY_TIMEZONE is the one env var apps/admin and apps/api both read
// (same name, set the same in both apps' env — see
// build_tools/env/*.env.example) so their date displays agree; not shared
// via @coolestprojects/database, which is schema, not app config. Same
// fallback default as apps/api's mail-context.ts, so an unset var still
// keeps both apps in agreement. Only callable server-side (login.ts) —
// browser-bundled components have no process.env, so the resolved value
// rides along on currentAdmin instead (see components/login/authenticate.ts).
export function displayTimezone(): string {
  return process.env.DISPLAY_TIMEZONE || 'Europe/Brussels';
}
