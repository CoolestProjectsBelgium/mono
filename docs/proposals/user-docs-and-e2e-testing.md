# Proposal: end-user docs and e2e test docs in this repo

Status: **draft, not adopted** — not linked from `docs/README.md` or `scripts/check-docs.mjs`'s required-file list yet. This is a proposal to react to, not a decision already made.

## Problem

`docs/` today is entirely developer/architecture-facing: `docs/README.md` calls it "source of truth for monorepo architecture and per-package orientation", and `scripts/check-docs.mjs` enforces that shape (every app/package gets a `Purpose`/`Stack`/`Entrypoints`/`Talks to`/`Out of scope`/`Status` page). Two things have no home anywhere in the repo:

1. **End-user documentation** — how a participant registers, how a mentor/coach guides a team, how an admin runs an event day, how jury voting works from the juror's side. None of this exists in-repo today; if it exists at all, it's somewhere outside version control.
2. **End-to-end test documentation** — there is no e2e test framework in this repo (no Playwright/Cypress/etc. in any `package.json`, no `e2e/` directory anywhere) and no written catalog of the user journeys that matter (registration → project submission → voting → certificate, etc.). CI (`.github/workflows/`) currently only deploys; it runs no tests at all, unit or e2e.

Both are real gaps, but they're different in kind: user docs describe the *product*; e2e docs describe *what "working" means for a real user journey*, ideally traceable to actual test coverage. Worth keeping in one place (this repo) for the same reason `docs/` already exists: versioned with the code, reviewed via PR, and readable by both humans and the coding agents already primed to read `docs/` first (`AGENTS.md` → `docs/README.md`).

## Proposed structure

Mirror the existing `docs/apps/`, `docs/packages/` pattern rather than inventing a new convention.

```
docs/
  user-guide/
    README.md              # index: who's the audience for each page
    registration.md         # participant: sign up, join a project, team up
    mentor.md               # coach/mentor: prep a team, day-of logistics
    admin.md                 # organizer: event setup, approvals, seating, certificates
    jury.md                   # juror: scoring, voting, awards
  e2e/
    README.md               # index + how to run, once a framework exists
    scenarios/
      registration.md        # user journey → expected outcome → status
      voting.md
      admin-event-setup.md
```

- **`docs/user-guide/`**: task-oriented, written for the person doing the task — no code, no architecture, no internal service names. One page per audience (matches this project's own roles: participant, mentor, admin/organizer, jury), not per app, since a real task (e.g. "register for the event") can span `registration` + `apps/api` + email delivery and a user doesn't care about that seam.
- **`docs/e2e/scenarios/`**: one page per user journey. Each entry states the flow in plain steps, the expected end state, and — this is the important part — a **status** column (`documented only` / `manually verified` / `automated`) plus a link to the actual test file once one exists. This lets the catalog exist and be useful *before* any e2e framework is adopted, and becomes the index of what the Playwright suite (see recommendation below) should cover.

## E2E framework recommendation: Playwright

Grounded in what's already in this repo, not a generic pick:

1. **Headless Chromium is already first-class here.** `apps/api` depends on `puppeteer@^25.2.1` for presentation rendering, and `.devcontainer/start.sh` already installs Chrome plus the exact shared-library set Chromium needs to launch (`libnspr4`, `libnss3`, `libdrm2`, `libgbm1`, `libxkbcommon0`, `libxcomposite1`, …) — functionally the same list `npx playwright install --with-deps chromium` would install. Adopting Playwright doesn't add a new class of environment dependency, it reuses infra that's already provisioned. (Puppeteer itself isn't a fit for this job: it's a browser-automation library with no test runner, assertions, retry/auto-waiting, or reporter built in — Playwright is its closest spiritual successor, built largely by the same original team, but as a full test framework.)
2. **TypeScript + Vitest-adjacent ergonomics.** Every workspace here is TypeScript, and three of the five relevant apps (`voting`, `registration`, `eventguide`) already run Vitest. Playwright's own test runner (`test`/`expect`, native TS, ESM) is the closest sibling in feel among the major e2e tools — closer than Cypress's separate GUI-first runner and its own assertion style. Cypress also has weaker multi-origin/multi-tab support, which matters here: a registration → voting handoff or an admin action opening a new tab is native in Playwright, awkward in Cypress.
3. **Maps cleanly onto five separate apps.** Playwright's `projects` config is a natural fit: one project per app (`admin`, `voting`, `registration`, `eventguide`, `presentation`), each with the port this repo already assigns it (CLAUDE.md's port table) and a `webServer` command each app's `package.json` already has — `preview` after `generate` for the three Nuxt apps (testing the actual static build that gets deployed, not just the dev server, is more faithful to prod) and `start:dev` for `admin`'s Express/AdminJS server.
4. **CI has nowhere to fall over.** `.github/workflows/deploy-*.yml` already runs Node 24 on `ubuntu-latest` — `npx playwright install --with-deps chromium` on that same runner is the standard, well-supported path. No new self-hosted runner, no new base image.
5. **Auth fits the existing seed story.** `apps/api`'s `event:init` CLI command already seeds admin/jury/presentation accounts for local dev. Playwright's `storageState` / global-setup pattern (log in once, save the session, reuse it across specs) plugs straight into that instead of needing new test-only backend endpoints.

Proposed placement: a new `e2e/` npm workspace (root `package.json` workspaces glob), `playwright.config.ts` with one project per app as above, `tests/` mirroring `docs/e2e/scenarios/` 1:1 (one spec per scenario doc, so the doc's "status" column and the spec file line up). Scoped to Chromium only initially — matches the existing Puppeteer precedent and avoids paying for Firefox/WebKit browser installs this project has no signal it needs.

## What this proposal does *not* decide

- The concrete CI wiring for the new `e2e/` workspace (a new workflow vs. extending an existing one; whether it runs on every PR or just before deploy) — worth its own pass once the workspace exists.
- Whether every scenario needs an automated test at all — some may stay "documented + manually verified" indefinitely if the ROI on automating them is low (e.g. a rare admin flow).

## Enforcement

Recommend **not** wiring either new tree into `scripts/check-docs.mjs`'s strict schema (`REQUIRED_FILES`, `STUB_SECTIONS`) yet. That schema fits stable, uniform pages (every app really does have a Stack and Entrypoints); user-guide and e2e-scenario pages don't share that shape and forcing it early would produce filler sections. Once a handful of real pages exist and a shape stabilizes, add a lighter check (e.g. just "every file in `docs/e2e/scenarios/` has a Status line") rather than reusing `STUB_SECTIONS` wholesale.

## Ownership / staying current

The reason ad-hoc docs rot is that nothing forces an update. Two lightweight hooks, not new process:

- **PR template nudge** (not a hard gate): when a PR touches a user-facing flow, a checklist line — "does `docs/user-guide/` need an update?" — same spirit as this repo's existing `npm run check-docs` habit, but advisory for these two trees rather than enforced, at least initially.
- **e2e scenario ↔ test file link**: once real e2e tests exist, each scenario page links straight to its spec file. A stale doc becomes visible the moment someone opens the linked file and it's gone/renamed — cheap staleness detection without extra tooling.

## Rollout

1. Land the two empty-but-structured trees (this proposal, if accepted) with one real page each — e.g. `docs/user-guide/registration.md` and `docs/e2e/scenarios/registration.md` — as a concrete example rather than a template nobody fills in.
2. Get feedback from whoever actually writes/owns event-day docs today (if that's not you, worth naming who).
3. Once 3-4 pages exist in each tree and the shape feels right, link both from `docs/README.md` and decide whether either graduates into `scripts/check-docs.mjs`.
4. Separately: stand up the Playwright `e2e/` workspace and start automating the highest-value scenarios from the catalog.
