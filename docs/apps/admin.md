# Admin app

## Purpose

AdminJS-based admin panel for Coolest Projects staff. Manages events, registrations, accounts, and voting resources with role-based access (`Account.account_type`: `super_admin` sees/edits everything across all events; `admin` is scoped to their session's event and can edit their own account). `jury` accounts never authenticate into this app at all — they log in separately against the voting SPA (see [`authorisations.ts`](../../apps/admin/src/authorisations.ts) L1-4 and [api.md](api.md) voting auth) — so no page or resource in AdminJS needs a jury-specific access check.

## Stack

- AdminJS 7 on **Express** (`@adminjs/express`, `@adminjs/sequelize`) — **not** NestJS and **not** Nuxt
- TypeScript ESM (`"type": "module"`, `.js` extensions in local imports), `tsx` for dev
- Custom UI: React bundled by AdminJS `ComponentLoader` (Rollup), using `@adminjs/design-system`
- `@coolestprojects/database` for models and Sequelize connection

Do not add Nest modules, controllers, guards, or `@adminjs/nestjs`. Do not use Vue, Tailwind, or Nuxt UI here. `database.ts` reads `DB_*` from `process.env` after `dotenv/config` — dest `npm install --omit=dev` only installs this app's `package.json` dependencies, so a Nest leftover would crash boot (`Cannot find package '@nestjs/config'`).

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

Default seed logins for this app (from API seeder, `apps/api/src/seeder/seed.ts`): `superadmin` (super_admin) / `admin` (admin) — passwords match the account name. The seeder also creates `jury`/`jury2`/`jury3` (account_type `jury`) and `presentation` (account_type `presentation`), but neither logs into AdminJS — jury uses the voting SPA and `presentation` is Basic-auth for the kiosk/Raspberry Pi slide display (see [api.md](api.md)). Dest also has `dylan` (super_admin) and `dylan-admin`.

## Talks to

- `packages/database` — Sequelize models (direct DB access)
- MySQL — same database as API
- `apps/api` — floorplan list/upload/activate via `AdminController` (`/admin/floorplans*`), presentation-asset list/upload/delete (`/admin/presentation-assets*`), presentation-deck preview/quick-edit (`/admin/presentation-slides/preview*`), certificate status/preview/pdf/assets via the dedicated `CertificateController` (`/admin/certificates*` — its own controller, not `AdminController`, but guarded the same way with `MandatoryAdminCookieGuard`), and voting admin actions, proxied from page handlers with the staff `adminjs` session cookie via `NestApiClient` (`apps/admin/src/api/nest-api-client.ts`). These server-to-server calls use the same `API_BASE_URL` as the browser (`https://api.coolestprojects.localhost:8443`). That hostname's `.localhost` TLD always resolves to loopback by default (RFC 6761), which is only correct from the host machine itself — so `workspace` has `extra_hosts` entries in `.devcontainer/docker-compose.yml` mapping every `*.coolestprojects.localhost` name to `host-gateway` (the host's own IP as seen from the container). That sends the request out to the host, where it hits Docker's existing `8443:443`/`8080:80` publish on `proxy` via hairpin NAT — the same path, port, and URL a browser uses; no `proxy` image changes needed. PictureSelector loads attachment images in the browser the same way, from `API_BASE_URL/projectinfo/attachments/*` (same cookie); the Presentation page's carousel `<img>` tags load `API_BASE_URL/admin/presentation-slides/preview/:key/image` directly for the same reason. Admin must **not** read or write `UPLOAD_ROOT` on the admin host.

Sequelize models registered in `apps/admin/src/database.ts` must include every association target (including through-models like `UserProject`). Omitting one crashes AdminJS boot with `X has not been defined`.

## How to extend

**CRUD:** add or tighten a resource in [`apps/admin/src/index.ts`](../../apps/admin/src/index.ts) (`properties`, `actions`, `features`). Scope by event with helpers in [`authorisations.ts`](../../apps/admin/src/authorisations.ts).

**Read-only report from raw SQL:** use [`RawSqlResource`](../../apps/admin/src/reporting/raw-sql-resource.ts) instead of a database `VIEW` + `sequelize.define()`. It's an AdminJS `BaseResource` subclass — no `@adminjs/sequelize` adapter, no migration — that runs any SELECT (joins, CTEs, window functions) via the shared `sequelize` connection from `database.ts` (the only DB access path; never open a separate connection), wrapping it as a derived table (`SELECT * FROM (<sql>) AS report_data WHERE ... ORDER BY ... LIMIT ... OFFSET ...`) so filtering/sorting/pagination stay in MySQL rather than being pulled into Node. It's inherently read-only (`create`/`update`/`delete` throw) — still hide `new`/`edit`/`delete`/`bulkDelete` in `options.actions` so the UI doesn't offer them.
Each report's query lives in its own file under [`apps/admin/src/reporting/reports/`](../../apps/admin/src/reporting/reports/), exporting just a `new RawSqlResource({ resourceId, sql, columns: [{ path, type?, isId? }], primaryKey })` instance — nothing AdminJS-specific. `index.ts` imports that resource and, like every other resource, builds its own `{ resource, features, options }` entry inline (`features: [importExportFeature(...)]`, `options.label`/`listProperties`/`actions`/`navigation: navReporting`) directly in the `resources: [...]` array. Add a new report by adding a new `reports/*.ts` file (exporting its resource, re-exported from `reports/index.ts`) and one matching entry in `index.ts`.
`view_Export_all` and `view_user_project_summary` (**Reporting** group) both use this now; their SQL was inlined from the `CREATE OR REPLACE VIEW` statements in `apps/admin/src/components/admin/SQL-data/`, so those DB views no longer need to exist for the resources to work.

**Custom screen:** register an AdminJS `pages` (or `dashboard`) entry with a `ComponentLoader` component and a server `handler`. The handler runs in Node and may use Sequelize + `context.currentAdmin`. The `.tsx` file runs in the AdminJS bundle: import UI from `@adminjs/design-system`, data via `ApiClient` from `adminjs`, and `import type` from the handler only. Recharts must be imported from `recharts/es6/...` (not the package barrel) or dest Rollup pulls CJS and crashes.

Existing custom pages: Dashboard, PictureSelector, VotingOverview, Tables, **EmailTemplates**, **Floorplans**, **Presentation assets**, **Presentation** (deck carousel preview + quick template edit-and-preview, proxying `PresentationService` via `AdminController`'s bridge routes — see [api.md](api.md#admin-presentation-preview)), **Certificates** (per-language PDF template, per-project text, and per-participant preview/download — see [Certificates](#certificates) below). Login is an override (`componentLoader.override('Login', …)`), not a page. Pages are not grouped in the sidebar the way resources are (see **Key resources** below) — they all sit in AdminJS's default flat pages list.

## Key resources

Sidebar resources are grouped by workflow via each resource's `options.navigation` in `index.ts`: **System** (`Account`, `Event` —
global, not event-scoped, see below), **Event setup** (`Tshirt`, `TshirtGroup`), **Translations** (`TshirtTranslation`,
`TshirtGroupTranslation`, `QuestionTranslation`), **Registration** (`Registration`, `Affiliation`, `Question`,
`QuestionRegistration`), **Projects & participants** (`Project`, `Attachment`, `User`, `UserProject`, `QuestionUser`),
**Venue & seating** (`EventTable`), **Voting & awards** (`Award`, `VoteCategory`, `Certificate`, `CertificateTemplate` — CRUD escape hatches for the **Certificates** page below), **Communication** (`EmailTemplate`),
**Presentation** (`PresentationSlide`), and **Reporting** (the two raw-SQL export resources, `view_Export_all` and
`view_user_project_summary` — see **How to extend** below).
Two `navigation` groups must never share the same `name` string —
AdminJS merges groups by name, not by the JS variable holding them.

| Resource | Notes |
|----------|-------|
| `Project` | Explicit list/show/filter/edit properties include `deletedAt` soft-delete timestamp |
| `UserProject` | Membership/voucher link; has its own `deletedAt` |
| `Account` | Password via `@adminjs/passwords`; `encryptedPassword` hidden. Not event-scoped: any role can see/edit only their own account (`id` match against `currentAdmin.id`); only `super_admin` sees/edits the full list, creates, or deletes accounts. Lives in the **System** navigation group. |
| `Event` | Not event-scoped by a foreign key — it's the event itself. `super_admin` sees and can create/edit/delete every event; every other role only sees the event tied to their session (`id` match against `currentAdmin.eventId`) and gets read-only access (`show` only, no `new`/`edit`/`delete`). Lives in the **System** navigation group. |
| `Affiliation` | Event-scoped CoderDojo catalog (`name`); same list as `GET /dojos` |
| `EmailTemplate` | Event-scoped CRUD + import/export; prefer **EmailTemplates** page for editing copy |

The dashboard handler in [`apps/admin/src/components/dashboard/handler.ts`](../../apps/admin/src/components/dashboard/handler.ts)
exports `DashboardResponse` and `DashboardTableItem` for reuse by TSX components, and uses the registered database
models directly for Sequelize counts (registrations, waiting list, vouchers used/unused, projects, users, videos,
per-language and per-gender breakdowns, plus a `tshirts`/`questions` table pair). It throws if no event is selected
on `currentAdmin` — there is no all-events fallback shape.

The Dashboard's main feature is an **event timeline**: five fixed phases (Event setup → Registration → Event day
preparation → Event day, with a Voting sub-activity → Results & wrap-up) built from the event's milestone dates
(`registrationOpenDate`, `registrationClosedDate`, `projectClosedDate`, `officialStartDate`/`eventEndDate`,
`votingStartDate`/`votingEndDate`). Each phase's status (`done` / `active` / `upcoming`) is derived client-side by
comparing "now" against that phase's start/end, and each phase links directly to the resources or pages staff need
during it (e.g. Event day preparation links to **Projects** and **Assign tables**; Results & wrap-up links to
**Awards**, **Certificates**, and the `view_Export_all` report) — see `buildTimeline` in
[`Dashboard.tsx`](../../apps/admin/src/components/dashboard/Dashboard.tsx).

The `PictureSelector` page lists every project for the selected event. Its confirmed-image controls are radio buttons,
allowing at most one confirmed attachment per project; saving a confirmed image updates the project attachment group.

The `VotingOverview` page shows event-scoped vote totals, a remaining-votes burndown, and a project/category vote breakdown. It
refreshes automatically every 15 seconds and displays the last successful update when a refresh request fails. Staff can start
voting for a duration, stop it, restart it after technical issues, publish an SSE message to jurors, and view calculated category results after voting closes. Restarting asks whether existing votes and awards should be deleted; preserving them supports a technical pause/resume workflow. Closing
voting generates one `Award` entry for every active participant project. Winning entries receive a category assignment; other entries keep a null category and can later hold encouraging jury text for certificate generation. The page shows score ranges, medians, outliers, ranked runner-ups,
and allows reassignment via a per-project dropdown listing every `VoteCategory` for the event (jury-voted and public-voted alike — public just marks a category as decided by the public vote, and staff may still need to override it, e.g. on suspected fraud) plus a "No award" option; categories already assigned to another project are hidden from the dropdown (except the project's own current category) while preventing a project from receiving more than one category award.
Chart components import Recharts from `recharts/es6/...` (not the package barrel) so AdminJS production Rollup does
not pull the CJS `lib/` graph that crashes the dest bundle.

The `Tables` page is a project-centric "Assign tables to projects" view: each active project shows its type, language, and
affiliation(s) (participants' `via` field, any value, not just CoderDojo) next to a per-project table dropdown (limited to free
tables plus the project's current one; picking "Unassigned" clears it). Projects can be grouped by type, affiliation, or
language to spot which projects fit together before assigning seating. There is no separate table-management list — swapping is
just reassigning two projects' dropdowns, and a table is freed by unassigning its project.

The **Floorplans** page (`apps/admin/src/components/floorplans/`) lists SVG files from the API (`GET /admin/floorplans`), uploads raw Visio SVG exports via the API (`POST /admin/floorplans`; auto-processed to `table_XX` groups with blink CSS on the API server), sets `Event.floorplanPath` on upload or via **Use for this event** (`POST /admin/floorplans/:filename/activate`), and deletes an uploaded file via **Delete** (`DELETE /admin/floorplans/:filename`). The **Delete** button is disabled client-side whenever `isActive` is true for the logged-in event, but that's only a same-event hint — floor plans are a shared, not per-event, pool (see [api.md](api.md#admin-floorplans)), so the API rejects deleting a file still active for *any* event even if the button wasn't disabled. The AdminJS handler proxies these calls to Nest via `NestApiClient` (`apps/admin/src/api/nest-api-client.ts`), which forwards the incoming `adminjs` session cookie; it does not touch `UPLOAD_ROOT` locally. Upload is a real multipart file, not JSON — see [File uploads](#file-uploads) below. After changing `process-visio-svg.ts` in `apps/api`, restart the API dev server.

The **Presentation assets** page (`apps/admin/src/components/presentation-assets/`) lists, uploads, and deletes logos/art an admin wants slide bodies to reference (`GET`/`POST /admin/presentation-assets`, `DELETE /admin/presentation-assets/:filename`) — separate from a single slide's own `imagePath`. The page shows the `{{lookup assets 'filename.png'}}` Handlebars syntax to paste into a slide's body in the **Presentation** resource; see [api.md](api.md#presentation-assets). Same multipart upload mechanism as Floorplans (see [File uploads](#file-uploads) below).

The **EmailTemplates** page (`apps/admin/src/components/email-templates/`) lets staff pick a mail template slug and
language (`nl` / `en` / `fr`) for the logged-in event, edit subject + HTML + plain text, preview with Handlebars, and save
via AdminJS `recordAction` on the `EmailTemplates` resource (`edit`). Loading/saving templates uses Sequelize directly (same
DB as `apps/api`), but the render **context** for previews always comes from `apps/api`'s
`POST /admin/mail-templates/context` via `NestApiClient` — the page handler no longer builds context locally. That endpoint
calls the same `buildMailContext` function [`MailerService`](../../apps/api/src/mailer/mailer.service.ts) uses for real
sends, so a preview can never drift from what a real email would render; see
[api.md](api.md#admin-mail-template-context). Preview then compiles the returned context with
`Handlebars.compile(..., { noEscape: true })` on bodies — same compile flag as `MailerService`.
Before save/preview, the client pretty-prints HTML (Handlebars tokens masked first) and shows non-blocking lint warnings.
TinyMCE loads from CDN for visual HTML editing; use the Source tab for `{{#if}}` block helpers.
The page also derives whether a template uses a `User` or `Registration` context (`getContextRecordType`) and lets staff
select an event-scoped record (dropdown populated by a direct Sequelize read — the record list itself isn't part of the
mail context). Selecting a record, or leaving none selected, both fetch context from the API: with a `recordId` it's that
real record's data plus their owned project (`user` kind only); without one the API falls back to the first record of that
kind (by `id`) so previews always render a real Event too — never a synthetic placeholder person. The `EmailTemplate` CRUD
resource remains available (event-scoped list/search) as an escape hatch.

| Path | Role |
|------|------|
| `email-templates/handler.ts` | Load/save templates via Sequelize; fetch preview context and render via the API + Handlebars |
| `email-templates/render-preview.ts` | Handlebars compile of a caller-supplied context |
| `email-templates/format-html.ts` | Mask tokens, pretty-print, lint |
| `npm run test --workspace=apps/admin` | Unit tests for helpers |

### Certificates

The **Certificates** page (`apps/admin/src/components/certificates/`) generates a per-participant PDF certificate —
one PDF per project+user pair, not per project — rendered server-side by `apps/api`'s `CertificateController`
(`certificate/certificate.controller.ts`) with Puppeteer + Handlebars, the same rendering shape as
[`PresentationSlide`](api.md#admin-presentation-preview) (content-hash cache keyed by template + participant fields
+ an assets fingerprint; a cache hit skips re-rendering). The page has four sections:

1. **Template** — one shared HTML body per language (`nl`/`fr`/`en`, `CertificateTemplate.bodyHtml`), edited in a
   textarea and saved via `api.recordAction`/`resourceAction` against the `CertificateTemplates` resource (there is
   no explicit "save template" handler action — it goes through the standard AdminJS resource actions, like
   EmailTemplates does for `EmailTemplate`). Merge fields available in the body: `{{participant.firstname}}`,
   `{{participant.lastname}}`, `{{project.name}}`, `{{event.eventTitle}}`, `{{certificate.text}}`,
   `{{#if award.won}}...{{award.categoryName}}...{{/if}}`, and uploaded assets via
   `{{lookup assets 'logo.png'}}`.
2. **Assets** — logos/seals/signatures, uploaded/listed/deleted via the same multipart pattern as Floorplans and
   Presentation assets (`GET`/`POST /admin/certificates/assets`, `DELETE /admin/certificates/assets/:filename`; see
   [File uploads](#file-uploads) below). Puppeteer never touches the filesystem for these — the service inlines
   each asset as a `data:` URI before rendering.
3. **Per-project text review** — one editable `Certificate.text` row per project, seeded from that project's
   `Award.text` the first time a project is loaded (`sync-from-awards`, safe to call repeatedly — it never
   overwrites an existing row). Staff can hand-edit a project's text (flagged `isManual` once it diverges from the
   award text) or **Reset** it back to the award text.
4. **Per-participant preview + download** — a status table (one row per project participant) showing whether that
   participant's language has a template and whether their cached PDF is up to date, a **Preview** button
   (`POST /admin/certificates/preview`, renders with the *currently edited, unsaved* template/text — never written
   to the render cache) and a direct download link to `GET /admin/certificates/:projectId/:userId/pdf` (the cached,
   saved version — regenerated on that request only if the content hash is stale).

### File uploads

Every AdminJS file upload (Floorplans, Presentation assets, Certificate assets, and — once a page exists for it — a slide's own `imagePath`) works the same way, and it's worth understanding once rather than per-page:

1. **AdminJS's own router parses the multipart body for you.** `buildAuthenticatedRouter` in `index.ts` wraps every page-handler route (`@adminjs/express`'s `buildRouter.js`) in `express-formidable` — this isn't something the app opts into per-route, it's automatic for every page action. A React component just builds a browser `FormData` (`formData.append('file', file); formData.append('action', 'upload')`) and passes it as `data` to `api.getPage({ pageName, method: 'post', data: formData })` — axios sends a `FormData` as real multipart automatically, no manual `Content-Type` needed.
2. **The page handler re-encodes the parsed file into a real request to Nest.** `request.payload.file` is formidable's parsed file (spooled to a temp path — `{ path, name, type }`, not a Buffer in memory). The handler builds a Node-side `FormData` (the `form-data` package, not the browser global) from `createReadStream(file.path)` and sends it via `NestApiClient.postForm()` — a new method alongside `get`/`post`/`put`/`delete` that attaches the CSRF token the same way those do, and sets `maxBodyLength`/`maxContentLength: Infinity`. That reaches Nest's `FileInterceptor` route exactly like the participant-facing attachment upload does — see [api.md](api.md#admin-file-uploads).
3. **No size limit.** `buildAuthenticatedRouter`'s 5th argument, `{ maxFileSize: Infinity }`, overrides `express-formidable`'s 200MB default. Admin uploads are gated by session auth, not content restrictions.

This two-hop shape (browser → AdminJS page action, parsed once by formidable → re-encoded once, sent to Nest, parsed again by multer) is a deliberate trade-off: AdminJS's page-handler pipeline has no way to stream a raw request through untouched (formidable already consumed it by the time a handler runs), so the alternative would be bypassing AdminJS's router entirely with a sibling Express route — more moving parts, and it loses the session-cookie/CSRF handling `NestApiClient` already provides for free.

## Out of scope / unknowns

- HTML/PDF export for translators (deferred)
- Full custom AdminJS action catalog beyond the pages above
- How judge voting dashboard integrates with live voting app

## Status

Status: deep
