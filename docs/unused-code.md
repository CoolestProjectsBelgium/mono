# Unused code audit

Snapshot from a repo-wide sweep on 2026-09-09 (`npx knip`, cross-checked by hand against
AdminJS's dynamic `ComponentLoader` and Nuxt auto-imports, which produce false positives in
raw tool output). Re-verified and acted on 2026-09-12 — see "Already cleaned up" below.

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

## Re-verified false positives (kept, not removed)

Knip flagged these as unused, but each is a false positive from dynamic loading or
CLI-binary usage that static import analysis can't see. Left in place:

- `apps/admin`, `apps/api`: `mysql2` — no direct import, but Sequelize's `mysql` dialect
  requires the driver dynamically by name at runtime; `packages/database` (where Sequelize is
  actually configured) relies on it being resolvable via npm workspace hoisting
- `apps/admin`: `recharts` — actually imported in `apps/admin/src/components/voting/Voting.tsx`
  (knip missed it, likely through the `recharts-es6.d.ts` shim)
- root: `@nestjs/cli` — provides the `nest` binary used by `apps/api`'s `start`/`start:dev`
  npm scripts; not a source import so knip can't trace it

## Already cleaned up (2026-09-12)

- `apps/api/src/auth/auth.service.spec.ts` — fully commented-out spec for a service that no
  longer exists under that name (removed 2026-09-09).
- `apps/admin/src/theme.ts` — zero references anywhere in the app; removed.
- `apps/api/src/dto/sas-token.dto.ts` — zero references in `apps/api/src`; removed.
- `apps/registration/utils/participant-remove.ts` (+ its `.spec.ts`) — only referenced by its
  own spec, no app code called it; removed.
- `apps/voting/components/UserProfile.vue` — not imported, not used in any template; removed.
- `build_tools/lib/level27.mjs` (+ `build_tools/level27.spec.mjs`) — exported
  `restartRequest`/`restartComponent`, called from nothing but its own spec, never wired into
  `cli.mjs`/`deploy.mjs`; removed.
- Nine broken debug scripts under `apps/admin/scripts/` (`compare-process-results.mjs`,
  `compare-upload-output.mjs`, `reprocess-active-floorplan.mjs`, `test-admin-upload-e2e.mjs`,
  `test-form-encoding.mjs`, `test-handler-direct.mjs`, `test-handler-upload.mjs`,
  `test-truncated-upload.mjs`, `test-wrong-order.mjs`) — all imported
  `apps/admin/src/components/floorplans/process-visio-svg.ts`, which no longer exists (that
  logic now lives in `handler.ts`); each would have crashed on `node <script>`; removed.
- `apps/api`: `nestjs` (a placeholder npm package unrelated to the real `@nestjs/*` scoped
  packages, zero references) and `passport-custom` (the last dependent — the `filesign`
  Passport strategy — was already removed, see [security-assessment-2026-09.md](security-assessment-2026-09.md) H12); removed from `package.json`.
- root: `unstorage` — no direct import anywhere in source (only appears transitively in
  generated Nuxt build output); removed from `package.json`.
- `packages/database`: `@adminjs/express`, `@nestjs/config`, `adminjs` — a shared Sequelize
  models package has no business depending on AdminJS or Nest config; zero references in
  `packages/database/src`; removed from `package.json`.
