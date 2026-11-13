# Dependency vulnerabilities — remediation punch list

Handoff document for whoever (human or agent) picks up the dependency-vulnerability work. It is self-contained: you do not need the conversation that produced it.

Snapshot date: 2026-11-13. Branch: `best-practices-hardening`, 6 commits ahead of `main`, last commit `0767249` (the Nuxt 4 upgrade, not yet pushed).

## Where things stand

GitHub Dependabot reports 85 open alerts (2 critical, 27 high, 45 moderate, 11 low). That count is for the default branch, `main`. `npm audit` on the two lockfiles gives:

| Lockfile | Critical | High | Moderate | Low | Total |
|----------|----------|------|----------|-----|-------|
| `main` | 6 | 28 | 76 | 4 | 114 |
| `best-practices-hardening` | 0 | 4 | 68 | 3 | 75 |

`npm audit` and Dependabot count differently, so the totals do not match; the direction does. The branch's dependency bumps already clear every critical (`handlebars`, `simple-git`, `shell-quote`, `vitest`, `tinypool`) and most highs (`multer`, `nodemailer`, `puppeteer`, `vite`, `sharp`, `body-parser`, `node-forge`, `zod`, and others).

The Dependabot alert list itself was not read: the Dev Container has no `gh` CLI. If you have access, compare it against the tables below before starting.

Do not run `npm audit fix` with `--force` or `--legacy-peer-deps`. Several of its suggested "fixes" are downgrades (for example `imap@0.8.17`, `typescript-eslint@8.36.0`, `nuxt@4.1.3`); fix each root cause below instead.

## Task 0 — merge the branch

Merging `best-practices-hardening` into `main` removes all criticals with no further work. This is a decision for the repository owner; do not merge or open a pull request unless asked.

## The 4 remaining highs

They come from two roots (Tasks 1 and 3). Tasks are ordered by value for effort.

### Task 1 — replace `imap` in the API (3 highs)

- **Chain:** `imap@0.8.19` → `utf7@1.0.2` → `semver@5.3.0` (ReDoS). `imap` is unmaintained; there is no fixed version. `npm audit`'s suggested "fix" is a downgrade to 0.8.17 and is not a fix.
- **Used in:** [apps/api/src/background/background.service.ts](../apps/api/src/background/background.service.ts) only — the bounce-mail job (`handleBounce`, `getBounceMessages`, `readMessageBody`). Connection settings come from `mailing.imap_*` in [apps/api/src/config/configuration.ts](../apps/api/src/config/configuration.ts).
- **Do:** replace with a maintained client. `imapflow` is the usual choice (promise-based, same author as `mailparser` and `nodemailer`, both already dependencies). Remove `imap` and `@types/imap` from [apps/api/package.json](../apps/api/package.json).
- **Keep:** the behaviour of the bounce job — which mailbox is read, which messages are parsed with `mailparser`, and that processed messages are deleted. Read the existing code and its spec before rewriting.
- **Check:** there is no automated test against a real IMAP server. Say so in your report rather than claiming it is verified end to end.

### Task 2 — done: Nuxt 4 and `@nuxtjs/i18n` 10 (5 highs cleared)

Commit `0767249` moved registration, voting and eventguide to Nuxt 4.6.4, and registration to `@nuxtjs/i18n` 10.6.0 (`vue-i18n` 11.4.19). That cleared the five `vue-i18n`/`@intlify/*` highs (XSS through `srcdoc` with `escapeParameter`). Things to know if you touch these apps:

- Each Nuxt app has its own `vite ^8.3.8` dev dependency. Nuxt 4 ships Vite 8, while the root `node_modules/vite` stays on 6 for the API's Vitest. Without the per-app pin every Nuxt test fails with `Missing field moduleType`.
- Under Nuxt 4 the test environment evaluates `tests/setup.ts` twice, so the shared `mockFetch` is kept on `globalThis`. Specs that stub globals must keep the real `URL` constructor and real `document.createElement` for anything but what they fake, because Nuxt's link prefetching and head renderer use them on timers.
- `nuxt.config.ts` uses `vite.server.ws` (Vite 8 renamed it from `hmr`) and disables the `tailwindcss/nesting` PostCSS plugin, which Nuxt 4 cannot load and no stylesheet uses.
- Not verified: hot reload through the TLS proxy (`wss://*.coolestprojects.localhost:8443`), and a manual click-through in a browser.

### Task 3 — TinyMCE in admin (1 high)

Two separate things:

- **Bundled copy:** `tinymce@6.8.6` arrives through `@adminjs/design-system@4.1.1` → `@tinymce/tinymce-react@4.3.2`, which only allows TinyMCE 5 or 6. Several XSS advisories are fixed only in 7.9.3 and later. There is no upgrade path inside AdminJS 7. A search of `apps/admin/src` for `richtext` finds no resource property using AdminJS's rich-text type, so the bundled copy is probably never loaded. Confirm that in the running admin (open a resource edit form with long text fields and check the network tab for TinyMCE) before dismissing the alert with that reason. If it turns out to be used, an npm `overrides` entry forcing a newer TinyMCE needs manual testing of that editor.
- **CDN copy:** the email-template editor loads TinyMCE from `https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js` — a floating major tag with no integrity hash — at [apps/admin/src/components/email-templates/EmailTemplates.tsx](../apps/admin/src/components/email-templates/EmailTemplates.tsx) (`TINYMCE_SCRIPT`). Not in the audit, but pin an exact version (7.9.3 or later) and add `integrity` and `crossOrigin` attributes where the script tag is created. `apps/admin/src` sets no Content-Security-Policy (no `helmet`), so nothing there blocks the script; if a CSP is added later it must allow this origin.

## The moderates

68 in three families. None has a quick fix; treat them as planned upgrades.

| Family | Count | Cause | Fix |
|--------|-------|-------|-----|
| AdminJS 7 | 43 | `@tiptap/*` (prototype pollution, link XSS), `react-router`, `i18next-http-backend`, `xml2js` via `@adminjs/import-export`, `deepmerge` | None upstream: AdminJS 7 is the latest line. Options are npm `overrides` per package (test the admin UI) or accepting the risk for an admin-only, authenticated app. |
| Nuxt 4 / Nitro | 8 | Not Nuxt's own advisories: Nitro's dependencies `@vercel/nft` (via `glob`/`minimatch`), `archiver` (via `readdir-glob`) and `@rollup/plugin-node-resolve` (via `deepmerge`) | Wait for a Nitro release that updates them. `npm audit`'s suggested `nuxt@4.1.3` is a downgrade. |
| Dev tooling and `uuid` | 17 | `@nestjs/cli` and `typescript-eslint` via `glob`/`minimatch`; `sequelize` via `uuid` (also `sequelize-typescript`, `@nestjs/sequelize`, `connect-session-sequelize`); `@vue/test-utils` via `js-beautify` | Tooling does not ship to production. `typescript-eslint` is already at the latest release (8.72.2), which is still in the affected range, so there is nothing to update to yet; `npm audit`'s suggested "fix" (8.36.0) is a downgrade. The `uuid` advisory only affects callers that pass their own buffer to v3/v5/v6. |

## How to work in this repository

- Read [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md) first. npm workspaces monorepo; run everything from the repo root with `--workspace=<path>`.
- Dev servers run inside the Dev Container only. Restart one after a material change with the command in CLAUDE.md. The API logs to `/tmp/api.log`; the other apps log to `/tmp/<name>.log` from the next container start (the updated `.devcontainer/start.sh`), or when restarted with the CLAUDE.md command.
- After every task, run for each workspace you touched: `npm run build`, `npm test`, and `npm run lint` (only `apps/api` and `apps/admin` have lint). Then `npm audit` to confirm the count dropped, and `npm run check-docs`.
- Current baselines to hold: `apps/api` lint 0 warnings, 376 tests; `apps/admin` lint 12 warnings (all React hooks, see below), 40 tests; `apps/registration` 306 tests; `apps/voting` 44 tests; `apps/eventguide` 43 tests.
- One root cause per commit. Commit and push only when asked.
- `npx tsc --noEmit -p tsconfig.json` in `apps/api` already reports two errors that predate this work (see below). The normal build does not type-check those files.

## Other open items from the same cleanup

Not vulnerabilities, but left open on this branch:

- **12 React hook lint warnings in `apps/admin`** — 9 `react-hooks/set-state-in-effect`, 3 `react-hooks/exhaustive-deps`, in the page components under `apps/admin/src/components/*/`. Fixing them means restructuring how pages load data on mount; those components have no tests.
- **e2e setup drift in the API** — [apps/api/test/global-setup.ts](../apps/api/test/global-setup.ts) line 57 calls `seedDatabase` with 24 arguments where it now takes 31. The canonical call is `initEventDB` in `apps/api/src/cli/event.command.ts`. The e2e suite (`npm run test:e2e --workspace=apps/api`) has not been run.
- **Type error in a spec** — `apps/api/src/voting/voting.service.spec.ts` line 59: mock object passed to `mockResolvedValue` is not assignable to the model type.
- **Admin `eventId` runtime type** — the login form posts the event as a form field, so `currentAdmin.eventId` can be a numeric string at runtime while [apps/admin/src/admin-types.ts](../apps/admin/src/admin-types.ts) types it as a number. Nothing breaks today (Sequelize and the API coerce it). Converting it once in `apps/admin/src/components/login/authenticate.ts` would make the type true.
