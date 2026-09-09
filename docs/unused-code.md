# Unused code audit

Snapshot from a repo-wide sweep on 2026-09-09 (`npx knip`, cross-checked by hand against
AdminJS's dynamic `ComponentLoader` and Nuxt auto-imports, which produce false positives in
raw tool output). Nothing here has been removed — this is a punch list to revisit.

## Confirmed unused files

| File | Evidence |
|------|----------|
| `apps/admin/src/theme.ts` | Zero references anywhere in the app |
| `apps/api/src/dto/sas-token.dto.ts` | Zero references in `apps/api/src` |
| `apps/registration/utils/participant-remove.ts` | Only referenced by its own `.spec.ts` — no app code calls it |
| `apps/voting/components/UserProfile.vue` | Not imported, not used in any template |
| `build_tools/lib/level27.mjs` | Exports `restartRequest`/`restartComponent`, called from nothing but its own spec — not wired into `cli.mjs`/`deploy.mjs` |

## Broken debug scripts

All import `apps/admin/src/components/floorplans/process-visio-svg.ts`, which no longer
exists (that logic now lives in `handler.ts`). Each would crash on `node <script>` today:

- `apps/admin/scripts/compare-process-results.mjs`
- `apps/admin/scripts/compare-upload-output.mjs`
- `apps/admin/scripts/reprocess-active-floorplan.mjs`
- `apps/admin/scripts/test-admin-upload-e2e.mjs`
- `apps/admin/scripts/test-form-encoding.mjs`
- `apps/admin/scripts/test-handler-direct.mjs`
- `apps/admin/scripts/test-handler-upload.mjs`
- `apps/admin/scripts/test-truncated-upload.mjs`
- `apps/admin/scripts/test-wrong-order.mjs`

## Likely-orphaned, not import-dead

One-off manual dev scripts, not wired to any `package.json` script or doc. Not proven dead —
confirm with whoever added them before removing:

- `apps/admin/scripts/check-floorplan-file.mjs`
- `apps/admin/scripts/check-map-page.mjs`
- `apps/admin/scripts/inspect-admin-processes.mjs`
- `apps/admin/scripts/kill-all-admin.mjs`
- `apps/admin/scripts/restart-admin-clean.mjs`
- `apps/admin/scripts/show-corruption.mjs`
- `apps/registration/scripts/auth-cross-origin-smoke.mjs`
- `apps/registration/scripts/auth-navigation-smoke.mjs`
- `apps/registration/scripts/verify-auth-cookie.mjs`
- `apps/voting/scripts/smoke-projects.mjs`
- `apps/eventguide/scripts/debug-map.mjs`

## Unused dependencies

Declared in `package.json` but not imported anywhere:

- `apps/admin`: `mysql2`, `recharts`
- `apps/api`: `mysql2`, `nestjs`, `passport-custom`
- root: `@nestjs/cli`, `unstorage`
- `packages/database`: `@adminjs/express`, `@nestjs/config`, `adminjs`

## Already cleaned up

- `apps/api/src/auth/auth.service.spec.ts` — fully commented-out spec for a service that no
  longer exists under that name (removed 2026-09-09).
