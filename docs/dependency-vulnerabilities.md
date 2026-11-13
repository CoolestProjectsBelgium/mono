# Dependency audit — findings and hardening

Record of the open dependency advisories, why each one is acceptable or waiting, and the hardening steps taken so far. It is also the handoff for whoever (human or agent) picks up dependency work next, and it is self-contained: you do not need the conversation that produced it.

Snapshot: 2026-11-13, `main` at `b8ac7ac` plus `97f9543` on `best-practices-hardening`. Regenerate the numbers with `npm audit` from the repo root; the per-advisory table below was built from `npm audit --json` and `package-lock.json`.

## Summary

| Date | Lockfile | Critical | High | Moderate | Low | Total |
|------|----------|----------|------|----------|-----|-------|
| 2026-09-05 | `main` (baseline, [security assessment](security-assessment-2026-09.md#dependency-audit-snapshot)) | 2 | 19 | 51 | — | 72 |
| 2026-09-12 | `main` (re-verification) | 2 | 20 | 56 | — | 78 |
| 2026-11-12 | `main` at `e24feaa`, before the hardening pass | 6 | 28 | 76 | 4 | 114 |
| 2026-11-13 | `main` after merging `best-practices-hardening` | 0 | 1 | 68 | 3 | 72 |

**How to read the totals.** `npm audit` counts *packages*, not problems: a package is listed when it has an advisory itself or depends on one that does. Of today's 72 entries, only 10 packages carry advisories (18 advisories in all, listed below); the other 62 are listed only because they depend on one of those 10. Dependabot counts per alert and per manifest, so its totals differ again. The Dependabot alert list was not read for this document (no `gh` CLI in the Dev Container).

**Current state in one line:** no critical; one high (TinyMCE, accepted risk); everything else is in AdminJS 7's own dependency tree or in build-time tooling, with no upstream fix yet.

## Findings

All 18 advisories open on 2026-11-13. "Pulled in by" is the direct dependency in each workspace that brings the package in. "Ships to production" means the package is part of a deployed app's runtime, as opposed to build or test tooling.

### Admin app — AdminJS 7 dependency tree

Everything here reaches the codebase only through `adminjs` 7.8 and its plugins (`@adminjs/design-system`, `@adminjs/express`, `@adminjs/import-export`, `@adminjs/logger`, `@adminjs/passwords`, `@adminjs/sequelize`) in `apps/admin`. AdminJS 7 is the latest major and pins these versions, so there is no fix short of npm `overrides` or replacing AdminJS. All of it runs behind the admin login: the app is mounted with `AdminJSExpress.buildAuthenticatedRouter` ([apps/admin/src/index.ts](../apps/admin/src/index.ts)), and only `admin` and `super_admin` accounts can log in.

| Severity | Package (installed) | Advisory | Fixed in | Assessment | Status |
|----------|---------------------|----------|----------|------------|--------|
| High | `tinymce` 6.8.6 | [XSS through `mce:protected` comments](https://github.com/advisories/GHSA-v98h-vmpc-fpqv) | 7.9.3 | See [TinyMCE](#tinymce--accepted-risk). | Accepted risk |
| High | `tinymce` 6.8.6 | [XSS using media plugin `data-mce-object` injection](https://github.com/advisories/GHSA-vg35-5wq7-3x7w) | 7.9.3 | As above. | Accepted risk |
| High | `tinymce` 6.8.6 | [XSS using sanitization bypass through nested SVGs](https://github.com/advisories/GHSA-mh5m-5hw4-5c69) | 7.1.0 | As above. | Accepted risk |
| High | `tinymce` 6.8.6 | [XSS through `data-mce-` prefixed src, href, style attributes](https://github.com/advisories/GHSA-q742-qvgc-gc2f) | 7.9.3 | As above. | Accepted risk |
| Moderate | `tinymce` 6.8.6 | [XSS handling external SVG files through Object or Embed elements](https://github.com/advisories/GHSA-5359-pvf2-pw78) | 7.0.0 | As above. | Accepted risk |
| Moderate | `@tiptap/core` 2.1.13, 2.27.3 | [`mergeAttributes()` turns an own `__proto__` key into executable DOM attributes](https://github.com/advisories/GHSA-cp6q-959q-f8rh) | 3.30.4 | AdminJS's rich-text editor. Needs attacker-controlled attributes in content that admins edit. | Waiting on AdminJS |
| Low | `@tiptap/extension-link` 2.1.13 | [XSS in links](https://github.com/advisories/GHSA-vhrc-hgrq-x75r) | 2.10.4 | Same editor and content as above. | Waiting on AdminJS |
| Moderate | `react-router` 6.30.6 | [Open redirect via backslash in `<Link>` and `useNavigate`](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) | 7.18.0 | AdminJS's client-side routing; needs a crafted link followed by a logged-in admin. | Waiting on AdminJS |
| Moderate | `react-router` 6.30.6 | [Constructor injection via `deserializeErrors()` in SSR hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg) | 7.18.0 | Server-side rendering only. AdminJS renders in the browser, so this does not apply. | Not applicable |
| Moderate | `xml2js` 0.4.23 | [Prototype pollution](https://github.com/advisories/GHSA-776f-qx25-q3cc) | 0.5.0 | Used by `@adminjs/import-export` to parse XML imports. The import feature is enabled on six admin resources, so the input is a file an admin uploads. | Waiting on AdminJS |
| Moderate | `i18next-http-backend` 2.7.3 | [Path traversal and URL injection via unsanitised `lng`/`ns`](https://github.com/advisories/GHSA-q89c-q3h5-w34g) | 3.0.5 | AdminJS's translation loader in the browser. | Waiting on AdminJS |
| Low | `i18next-http-backend` 2.7.3 | [Incomplete URL validation permits SSRF](https://github.com/advisories/GHSA-xvq9-wjp8-hwqf) | 4.0.2 | As above. | Waiting on AdminJS |
| Low | `i18next-http-backend` 2.7.3 | [Namespace starting with `/` forms a protocol-relative URL](https://github.com/advisories/GHSA-9jhj-wvmw-cfx5) | 4.0.3 | As above. | Waiting on AdminJS |
| Low | `i18next-http-backend` 2.7.3 | [Query-parameter injection through `&` and `=` in `lng`](https://github.com/advisories/GHSA-3cmx-xjww-583x) | 4.0.4 | As above. | Waiting on AdminJS |

#### TinyMCE — accepted risk

Accepted on 2026-11-13 by the repository owner: TinyMCE is only reachable by admins.

- **Why it is flagged:** `tinymce@6.8.6` arrives through `@adminjs/design-system@4.1.1` → `@tinymce/tinymce-react@4.3.2`, which only allows TinyMCE 5 or 6. The fixes are in 7.x, so there is no upgrade path inside AdminJS 7.
- **Why the risk is acceptable:**
  - The whole admin app requires an admin login (see above).
  - The bundled copy is only used by the design system's TinyMCE editor component, and nothing in `apps/admin/src` uses that component.
  - The one place TinyMCE does run, the email-template editor, edits content that only admins write.
- **Where the exception is recorded:**
  - `.github/dependabot.yml` ignores `tinymce`, so Dependabot does not propose upgrades that cannot apply.
  - The GitHub Dependabot alert is to be dismissed as "Risk is tolerable to this project". This is done in the GitHub UI, not in the repo.
  - CI's `npm audit --audit-level=critical` does not fail on it. If that gate is tightened to `high`, it needs an allowlist for these advisories, because `npm audit` has no built-in ignore.
- **Revisit when:** TinyMCE becomes reachable by non-admins (for example, participant-facing rich text), AdminJS releases a design system that allows TinyMCE 7.9.3 or later, or the admin app moves off AdminJS 7.

### Build and development tooling

These run when building, linting or testing, not in deployed apps. The Nuxt apps deploy as statically generated files (`build_tools/lib/pack.mjs`), so Nitro's build dependencies never run in production either.

| Severity | Package (installed) | Advisory | Fixed in | Pulled in by | Status |
|----------|---------------------|----------|----------|--------------|--------|
| Moderate | `glob` 13.0.6 | [AbortSignal cancellation bypass allows post-timeout filesystem traversal](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | 14.0.2 | `@nestjs/cli` (api, root); `nuxt` build (`@vercel/nft`), `@nuxt/test-utils`, `@vue/test-utils` (registration, voting, eventguide) | Waiting on upstream releases |
| Moderate | `minimatch` 10.2.6 | [Denial of service via globparts amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249) | 11.0.1 | As `glob`, plus `typescript-eslint` (root) and `@nuxtjs/i18n` (registration) | Waiting on upstream releases. `typescript-eslint` is already at its latest release (8.72.2). |
| Low | `deepmerge` 4.3.1 | [`mergeObject()` allows prototype poisoning of returned objects](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | none yet | `@rollup/plugin-node-resolve`, used by AdminJS's component bundler (admin) and by Nitro (Nuxt apps); `fork-ts-checker-webpack-plugin` via `@nestjs/cli` | Waiting on upstream releases |

### Data layer

| Severity | Package (installed) | Advisory | Fixed in | Assessment | Status |
|----------|---------------------|----------|----------|------------|--------|
| Moderate | `uuid` 8.3.2, 9.0.1 | [Missing buffer bounds check in v3/v5/v6 when `buf` is provided](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | 11.1.1 | Pulled in by `sequelize` (api, database package), `sequelize-typescript`, `connect-session-sequelize` and AdminJS (admin). Only affects callers that pass their own output buffer to v3, v5 or v6. Sequelize only calls v1 and v4. AdminJS's bundled frontend contains a v5 import whose call site was not traced. | Waiting on upstream releases; low likelihood |

## Hardening steps

### Dependency hardening

| Date | Commit | Change | Effect on `npm audit` |
|------|--------|--------|------------------------|
| 2026-11-12 | `454883a` | **CI gate:** `.github/workflows/ci.yml` runs the docs check, lint, every build, every test suite and `npm audit --audit-level=critical` on pull requests and pushes to `main`; both deploy workflows require it. **Dependabot:** weekly npm and GitHub Actions updates (`.github/dependabot.yml`). **Node:** pinned to 24 via `.nvmrc` and `engines`. **Upgrades:** in-range lockfile updates plus Vitest 5, happy-dom 21, `@nuxt/test-utils` 4, Pinia 3 / `@pinia/nuxt` 0.11, nodemailer 10 and zod 4. | 114 → 79. All 6 criticals (`handlebars`, `simple-git`, `@simple-git/argv-parser`, `shell-quote`, `vitest`, `tinypool`) and 19 of 28 highs cleared. |
| 2026-11-13 | `0767249` | **Nuxt 4:** registration, voting and eventguide on Nuxt 4.6.4; registration on `@nuxtjs/i18n` 10.6.0 (`vue-i18n` 11). See [Nuxt 4 notes](#nuxt-4-notes). | 79 → 75. The five `vue-i18n`/`@intlify/*` highs (XSS through `srcdoc` with `escapeParameter`) cleared. |
| 2026-11-13 | `995cf88` | **`imap` → `imapflow`** in the API's bounce-mail job; `imap` and `@types/imap` removed. Also fixed two existing bugs that meant matched bounces were never deleted from the mailbox (connection closed before delete; sequence number passed to a UID-based call). See [docs/apps/api.md](apps/api.md#bounce-mail-detection). | 75 → 72. The three `imap` → `utf7` → `semver` ReDoS highs cleared. |
| 2026-11-13 | `b8ac7ac` | **CI fix:** the deploy-workflow contract specs (`build_tools/workflow-deploy-*.spec.mjs`) now check `node-version-file: .nvmrc`, which the workflows switched to in `454883a`. Without this, `test:build-tools` and therefore CI on `main` would fail. | — |
| 2026-11-13 | `97f9543` | **TinyMCE exception:** Dependabot ignore rule and the accepted-risk record above. | — (still listed by `npm audit`) |
| 2026-11-13 | — | `best-practices-hardening` fast-forwarded into `main` (`e24feaa..b8ac7ac`). | `main`: 114 → 72 |

Code-level hardening done in the same pass (input validation, admin auth fixes, SQL identifier checks, typed request objects) is recorded in the [security assessment addendum](security-assessment-2026-09.md#addendum--2026-11-13).

### Nuxt 4 notes

Things to know if you touch the Nuxt apps:

- Each Nuxt app has its own `vite ^8.3.8` dev dependency. Nuxt 4 ships Vite 8, while the root `node_modules/vite` stays on 6 for the API's Vitest. Without the per-app pin every Nuxt test fails with `Missing field moduleType`.
- Under Nuxt 4 the test environment evaluates `tests/setup.ts` twice, so the shared `mockFetch` is kept on `globalThis`. Specs that stub globals must keep the real `URL` constructor and real `document.createElement` for anything but what they fake, because Nuxt's link prefetching and head renderer use them on timers.
- `nuxt.config.ts` uses `vite.server.ws` (Vite 8 renamed it from `hmr`) and disables the `tailwindcss/nesting` PostCSS plugin, which Nuxt 4 cannot load and no stylesheet uses.
- Verified on 2026-11-13 with headless Chrome through the dev TLS proxy (`https://<app>.coolestprojects.localhost:8443`): all three apps load with no console errors or failed requests, and hot reload connects and delivers updates. Not checked: visual appearance.

## Possible next steps

None of these is required to keep CI green.

1. **Pin the CDN copy of TinyMCE.** The email-template editor loads `https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js`, a floating major tag with no integrity hash (`TINYMCE_SCRIPT` in [apps/admin/src/components/email-templates/EmailTemplates.tsx](../apps/admin/src/components/email-templates/EmailTemplates.tsx)). Pinning an exact version (7.9.3 or later) with `integrity` and `crossOrigin` attributes would stop a changed or compromised CDN release from running in admin sessions. `apps/admin/src` sets no Content-Security-Policy, so nothing blocks the script today.
2. **Tighten the CI audit gate to `high`.** Only the TinyMCE advisories would fail it. This needs an allowlist for them (for example with `audit-ci` or a small script over `npm audit --json`), since `npm audit` cannot ignore advisories itself.
3. **Override AdminJS's pinned dependencies.** npm `overrides` for `react-router`, `i18next-http-backend`, `xml2js` or `@tiptap/*` could clear most moderates, but each needs testing against the admin UI because AdminJS was not built against those versions.
4. **Re-run this audit** when Dependabot opens AdminJS, Nitro, `@nestjs/cli` or `typescript-eslint` updates, and update the tables above.

## How to work in this repository

- Read [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md) first. npm workspaces monorepo; run everything from the repo root with `--workspace=<path>`.
- Do not run `npm audit fix` with `--force` or `--legacy-peer-deps`. Several of its suggested "fixes" are downgrades (for example `typescript-eslint@8.36.0`, `nuxt@4.1.3`).
- Dev servers run inside the Dev Container only. Restart one after a material change with the command in CLAUDE.md. Apps log to `/tmp/<name>.log` when started by `.devcontainer/start.sh` (as of `2ac7f5a`) or with the CLAUDE.md command.
- After every change, run for each workspace you touched: `npm run build`, `npm test`, and `npm run lint` (only `apps/api` and `apps/admin` have lint). Then `npm audit` and `npm run check-docs`. To reproduce CI exactly, run its steps from `.github/workflows/ci.yml` in a fresh `npm ci` checkout with a clean environment, for example `env -i PATH="$PATH" HOME="$HOME" CI=true npm test --workspace=apps/api`. The Dev Container sets app variables (`CORS_ORIGINS`, `DB_*`, `JWT_KEY`, and others) that the CI runner does not have, so a test that leans on one passes locally and fails on CI. In specs, change variables with `vi.stubEnv` instead of replacing `process.env`.
- Current baselines to hold: `apps/api` lint 0 warnings, 382 tests; `apps/admin` lint 12 warnings (all React hooks, see below), 40 tests; `apps/registration` 306 tests; `apps/voting` 44 tests; `apps/eventguide` 43 tests; `test:build-tools` 43 tests.
- One root cause per commit. Commit and push only when asked.

## Other open items from the same cleanup

Not vulnerabilities, but still open:

- **12 React hook lint warnings in `apps/admin`** — 9 `react-hooks/set-state-in-effect`, 3 `react-hooks/exhaustive-deps`, in the page components under `apps/admin/src/components/*/`. Fixing them means restructuring how pages load data on mount; those components have no tests.
- **e2e setup drift in the API** — [apps/api/test/global-setup.ts](../apps/api/test/global-setup.ts) line 57 calls `seedDatabase` with 24 arguments where it now takes 31. The canonical call is `initEventDB` in `apps/api/src/cli/event.command.ts`. The e2e suite (`npm run test:e2e --workspace=apps/api`) has not been run.
- **Type error in a spec** — `apps/api/src/voting/voting.service.spec.ts` line 59: mock object passed to `mockResolvedValue` is not assignable to the model type. `npx tsc --noEmit -p tsconfig.json` in `apps/api` reports it; the normal build does not type-check spec files.
- **Admin `eventId` runtime type** — the login form posts the event as a form field, so `currentAdmin.eventId` can be a numeric string at runtime while [apps/admin/src/admin-types.ts](../apps/admin/src/admin-types.ts) types it as a number. Nothing breaks today (Sequelize and the API coerce it). Converting it once in `apps/admin/src/components/login/authenticate.ts` would make the type true.
- **`imapflow` not tested against a real mailbox** — only mocked tests cover the bounce job. It only runs when `CRON_JOB_BOUNCE` is set; try it on a test mailbox before enabling it in production.
- **Registration has no page title** — the browser tab is empty; voting sets one in its `nuxt.config.ts`.
