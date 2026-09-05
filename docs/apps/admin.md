# Admin app

## Purpose

AdminJS-based admin panel for Coolest Projects staff. Manages events, registrations, accounts, and voting resources with role-based access (`superadmin`, `admin`, `judge`).

## Stack

- AdminJS 7 on **Express** (`@adminjs/express`, `@adminjs/sequelize`) — **not** NestJS and **not** Nuxt
- TypeScript ESM (`"type": "module"`, `.js` extensions in local imports), `tsx` for dev
- Custom UI: React bundled by AdminJS `ComponentLoader` (Rollup), using `@adminjs/design-system`
- `@coolestprojects/database` for models and Sequelize connection

Do not add Nest modules, controllers, guards, or `@adminjs/nestjs`. Do not use Vue, Tailwind, or Nuxt UI here. The only Nest leftover is `@nestjs/config` `ConfigService` in `database.ts` for `DB_*` env.

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/admin/src/index.ts` | AdminJS app bootstrap, resources, auth |
| `apps/admin/src/database.ts` | Sequelize connection (`import 'dotenv/config'` first — ESM evaluates this module before `index.ts` body) |
| `apps/admin/src/components/` | Custom AdminJS UI: `loader.ts` + per-page `*.tsx` + server `handler.ts` |
| `apps/admin/src/authorisations.ts` | Event/role filters for resource actions |
| `npm run start:dev --workspace=apps/admin` | Dev server (port 3000 in Dev Container) |
| `apps/admin/.adminjs/`, `apps/admin/src/.adminjs/` | Dev-time Rollup output (`bundle.js`, `entry.js`). Gitignored. Pack copies to `frontend/assets/components.bundle.js` on deploy — dest does **not** run `initialize()`. |

Local URL (via proxy): `https://admin.coolestprojects.localhost:8443` (redirects to `/admin`)

On Level27, listen on `ADMINJS_PORT` **3000** (component port). Agency terminates TLS on 443 in front of Node — do not set `ADMINJS_PORT=443`.

Default seed logins (from API seeder): `superadmin` / `admin` / `jury` — passwords match the account name (`apps/api/src/seeder/seed.ts`). Dest also has `dylan` (super_admin), `dylan-admin`, and `dylan-jury`.

## Talks to

- `packages/database` — Sequelize models (direct DB access)
- MySQL — same database as API
- Does not call `apps/api` over HTTP

Sequelize models registered in `apps/admin/src/database.ts` must include every association target (including through-models like `UserProject`). Omitting one crashes AdminJS boot with `X has not been defined`.

## How to extend

**CRUD:** add or tighten a resource in [`apps/admin/src/index.ts`](../../apps/admin/src/index.ts) (`properties`, `actions`, `features`). Scope by event with helpers in [`authorisations.ts`](../../apps/admin/src/authorisations.ts).

**Custom screen:** register an AdminJS `pages` (or `dashboard`) entry with a `ComponentLoader` component and a server `handler`. The handler runs in Node and may use Sequelize + `context.currentAdmin`. The `.tsx` file runs in the AdminJS bundle: import UI from `@adminjs/design-system`, data via `ApiClient` from `adminjs`, and `import type` from the handler only. Recharts must be imported from `recharts/es6/...` (not the package barrel) or dest Rollup pulls CJS and crashes.

Existing custom pages: Dashboard, PictureSelector, VotingOverview, Tables, **EmailTemplates**, **Floorplans**. Login is an override (`componentLoader.override('Login', …)`), not a page.

## Key resources

| Resource | Notes |
|----------|-------|
| `Project` | Explicit list/show/filter/edit properties include `deletedAt` soft-delete timestamp |
| `UserProject` | Membership/voucher link; has its own `deletedAt` |
| `Account` | Password via `@adminjs/passwords`; `encryptedPassword` hidden |
| `Event` | Event-scoped access for non-superadmin roles |
| `Affiliation` | Event-scoped CoderDojo catalog (`name`); same list as `GET /dojos` |
| `EmailTemplate` | Event-scoped CRUD + import/export; prefer **EmailTemplates** page for editing copy |

The dashboard handler in [`apps/admin/src/components/dashboard/handler.ts`](../../apps/admin/src/components/dashboard/handler.ts)
exports `DashboardResponse` and `DashboardTableItem` for reuse by TSX components. It returns the same complete
response shape when no event is selected, and uses the registered database models directly for Sequelize counts.

The `PictureSelector` page lists every project for the selected event. Its confirmed-image controls are radio buttons,
allowing at most one confirmed attachment per project; saving a confirmed image updates the project attachment group.

The `VotingOverview` page shows event-scoped vote totals, votes over time, and a project/category vote breakdown. It
refreshes automatically every 15 seconds and displays the last successful update when a refresh request fails.
Chart components import Recharts from `recharts/es6/...` (not the package barrel) so AdminJS production Rollup does
not pull the CJS `lib/` graph that crashes the dest bundle.

The `Tables` page supports selecting two tables and swapping their project assignments while keeping assignments scoped
to the selected event.

The **Floorplans** page (`apps/admin/src/components/floorplans/`) lists SVG files in `UPLOAD_ROOT/floorplans/` (upload time from file `mtime`), uploads raw Visio SVG exports (auto-processed to `table_XX` groups with blink CSS injected **after** table ID assignment), and sets `Event.floorplanPath` for the logged-in event on upload. Upload rejects SVGs when processing would corrupt markup. After changing `process-visio-svg.ts`, restart the admin dev server (`prestart:dev` runs `npm run build`). If uploads still corrupt the SVG (table IDs inside `x`/`y` attributes), kill **all** stale `tsx watch src/index.ts` admin processes in the Dev Container (`node apps/admin/scripts/kill-all-admin.mjs`) before starting a single fresh instance — repeated restarts without killing orphans can leave an old processor bound to port 3000. Judges cannot access this page.

The **EmailTemplates** page (`apps/admin/src/components/email-templates/`) lets staff pick a mail template slug and
language (`nl` / `en` / `fr`) for the logged-in event, edit subject + HTML + plain text, preview with Handlebars dummy
data, and save via AdminJS `recordAction` on the `EmailTemplates` resource (`edit`). It does not call `apps/api`; preview compiles in the page handler with
`Handlebars.compile(..., { noEscape: true })` on bodies — same compile flag as [`MailerService`](../../apps/api/src/mailer/mailer.service.ts).
Before save/preview, the client pretty-prints HTML (Handlebars tokens masked first) and shows non-blocking lint warnings.
TinyMCE loads from CDN for visual HTML editing; use the Source tab for `{{#if}}` block helpers. Judges cannot access this page.
The page also derives whether a template uses a `User` or `Registration` context, lets staff select an event-scoped record,
and loads that record as editable context JSON for previews. Empty context continues to use the dummy preview data.
The `EmailTemplate` CRUD resource remains available (event-scoped list/search) as an escape hatch.

| Path | Role |
|------|------|
| `email-templates/handler.ts` | Load/save/preview via Sequelize |
| `email-templates/render-preview.ts` | Dummy context + Handlebars compile |
| `email-templates/format-html.ts` | Mask tokens, pretty-print, lint |
| `npm run test --workspace=apps/admin` | Unit tests for helpers |

## Out of scope / unknowns

- HTML/PDF export for translators (deferred)
- Full custom AdminJS action catalog beyond the pages above
- How judge voting dashboard integrates with live voting app

## Status

Status: stub
