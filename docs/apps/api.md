# API app

## Purpose

Central NestJS HTTP API for Coolest Projects. Serves registration, login, project info, voting, event guide, presentation, and shared settings endpoints. Uses Sequelize with models from `@coolestprojects/database`.

## Stack

- NestJS 11, Express, TypeScript
- `@nestjs/sequelize`, `mysql2`
- Passport JWT/cookie auth, `@nestjs/jwt`
- Swagger (`@nestjs/swagger`), scheduled jobs (`@nestjs/schedule`)
- Mail (`nodemailer`), file upload, Puppeteer, Azure blob storage

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/api/src/app.module.ts` | Root module, Sequelize config, controller registration |
| `apps/api/src/main.ts` | Bootstrap (not listed — standard Nest entry) |
| `apps/api/src/cli.ts` | CLI entry (`nestjs-command`) |
| `npm run start:dev --workspace=apps/api` | Dev server (port 3001) |
| `npm run seed-db --workspace=apps/api` | Seed DB via `event:init` CLI |
| `npm run seed-voting --workspace=apps/api` | Ensure jury voting test projects (links projects to event tables; runs full seed if DB is empty) |
| `npm run seed-pictures --workspace=apps/api` | Add confirmed project photo attachments for the active event (`event:seed-pictures`; idempotent when attachments already exist) |

Local URL (via proxy): `https://api.coolestprojects.localhost:8443`

Security bootstrap ([`apps/api/src/main.ts`](../../apps/api/src/main.ts), [`bootstrap-security.ts`](../../apps/api/src/bootstrap-security.ts)): [Helmet](https://docs.nestjs.com/security/helmet) for HTTP headers; [CORS](https://docs.nestjs.com/security/cors) via `app.enableCors()` when `CORS_ORIGINS` is set (comma-separated registration/voting origins, `credentials: true`). CSRF uses `csrf-csrf` double-submit: `GET /csrf-token` plus `x-csrf-token` on mutating requests. The HMAC is bound to the `anonId` cookie, whose `Domain` comes from `COOKIE_DOMAIN` (not `NODE_ENV`). Participant `jwt` uses the same cookie options; responses must not `clearCookie('jwt')` for that live domain in the same `Set-Cookie` list as the new session, or browsers can drop the cookie and the SPA looks logged out.

Key env vars (set in `.devcontainer/docker-compose.yml`): `DB_*`, `JWT_KEY`, `API_PORT`, `API_BASE_URL`, `VOTING_KEY`, `CSRF_SECRET`, `COOKIE_DOMAIN`, `CORS_ORIGINS`, `UPLOAD_ROOT`, `FILE_*`.

## Talks to

- `packages/database` — all Sequelize models
- MySQL
- External: SMTP (mailer), Azure blob (files), Puppeteer (PDF/certs — usage TBD)

## Module map

| Module / area | Controller | Service | Role |
|---------------|------------|---------|------|
| `app` | `AppController` | `AppService` | Tshirts, questions, dojos, approvals, settings |
| `auth` | (module) | — | Passport strategies, JWT |
| `login` | `LoginController` | — | Login, logout, mail token |
| `registration` | `RegistrationController` | `RegistrationService` | New participant registration |
| `userinfo` | `UserinfoController` | — | User profile CRUD |
| `projectinfo` | `ProjectinfoController` | `ProjectinfoService` | Projects, attachments, participants, owner |
| `participant` | `ParticipantController` | `ParticipantService` | Participant add/remove |
| `voting` | `VotingController` | `VotingService` | Auth, languages, projects, votes |
| `eventguide` | `EventguideController` | `EventguideService` | Event guide data |
| `presentation` | `PresentationController` | `PresentationService` | Presentation data, generate |
| `file-upload` | `FileUploadController` | `FileUploadService` | File auth check |
| `mailer` | — | `MailerService` | Email sending (templates seeded from `apps/api/src/mailer/seed-email-templates.ts`; local capture via MailHog — see [local-setup.md](../local-setup.md)) |
| `tokens` | — | `TokensService` | Token helpers |
| `background` | — | `BackgroundService` | Scheduled background work |
| `event` | — | `EventService` | Event lifecycle |
| `seeder` | — | (CLI) | DB seeding |

Global: `InfoInterceptor` on all responses.

## Key flows

### Registration

`POST /registration` is public: `OptionalAdminCookieGuard` attaches an admin principal when a valid AdminJS cookie is present, but a missing or invalid cookie must not 401. `RegistrationService` creates `User`, `Registration`, related `Question*` / `Tshirt*` records. `gsm` / `gsm_guardian` are stored without spaces or separators (`STRING(13)` columns).

### Login / session

`POST /login`, `POST /login/logout`, `POST /login/mailToken` → auth cookies/JWT via `AuthModule` and `TokensService`.

Registration confirmation emails contain a JWT with `registrationID`. The first `POST /login` activates the registration (creates `User`, deletes the pending `Registration` row) and sets the session cookie. A second request with the same JWT returns **409** (`Registration already activated`) and does not create a session — the client should show “already confirmed” copy and offer `POST /login/mailToken` for a separate login JWT (`userID`). Invalid or expired JWTs return **401**.

`PATCH /userinfo` updates the profile but never writes `User.email`: the address is the login identity for magic-link auth. GSM fields are stripped of spaces/separators before save (same as registration).

`UserCookieInterceptor` refreshes the participant `jwt` cookie on authenticated responses. Routes that also accept the AdminJS session cookie (`GET /projectinfo/attachments/:id`, `GET /projectinfo/attachments/original/:id`) can resolve to an admin principal without a participant id; the interceptor skips those so an open admin session in the same browser cannot overwrite a participant session.

### Email templates

Branded en/nl/fr copy lives in [`apps/api/src/mailer/seed-email-templates.ts`](../../apps/api/src/mailer/seed-email-templates.ts) and is inserted by `seedDatabase` in [`apps/api/src/seeder/seed.ts`](../../apps/api/src/seeder/seed.ts). After changing templates, rebuild the API and re-run `npm run seed-db --workspace=apps/api` on a fresh database (or replace `EmailTemplates` rows for the active event). In the Dev Container, captured mail appears at http://localhost:18025.

All Handlebars context passed to a template — for a real send and for an admin preview alike — is built by the single `buildMailContext` function in [`apps/api/src/mailer/mail-context.ts`](../../apps/api/src/mailer/mail-context.ts). It takes an `eventModel` plus the raw `User` or `Registration` Sequelize record directly (no separate DTO/interface stands in for it), and nests the record under `context.user` or `context.registration` depending on `kind`, so both entity kinds produce an identical shape. `MailerService` is the only place that ever supplies a *real* token (minted by `TokensService` at send time) — `buildMailContext` itself never generates one.

`buildMailContext` resolves the Event itself, internally, via `resolveMailEvent(eventModel, person)`, which looks it up by the person's own `eventId` association — never by "whichever event is currently active" or an admin session's selected event. A participant's event can be over and they must still be able to receive mail for it (e.g. a login link), so no caller (`MailerService`, `AdminService`) ever resolves or passes in an `Event` itself; they get the resolved `Event` back (alongside `context`) for anything else they still need it for, like looking up which template to send.

Admin previews reuse the exact same function through a staff-only endpoint, `POST /admin/mail-templates/context` (`AdminController` / `AdminService.getMailTemplateContext`, guarded by `MandatoryAdminCookieGuard`). There is no `eventId` parameter — an admin's currently selected event has no bearing on which record can be previewed. Given `{ recordType, recordId }` it loads the real `User`/`Registration` (plus their owned `Project` for user records) and calls `buildMailContext` with `PREVIEW_TOKEN`, a fixed placeholder string — never a real JWT. `recordType` is required (the AdminJS page always knows it from the template, via `getContextRecordType`); without `recordId` it loads the first record of that kind (lowest `id`) instead of a synthetic placeholder, so a preview always renders a real Event too. If no record of that kind exists yet, the endpoint 404s. The AdminJS **EmailTemplates** page handler proxies to this endpoint via `NestApiClient` rather than rebuilding the context locally — see [admin.md](admin.md).

### Project management

`GET|POST|PATCH|DELETE /projectinfo` plus attachments and participant routes → `Project`, `UserProject`, `Attachment` models.

- `DELETE /projectinfo/attachments/:id` (owner): removes a photo unless `confirmed` or `internal` is true; `null` counts as unconfirmed so seeded and newly uploaded files can be deleted

- `DELETE /projectinfo` (owner alone): sets `Project.deletedAt` and soft-deletes all active `UserProject` rows for that project; rejected when registered co-participants exist
- `POST /projectinfo/change-owner/:newOwnerId`: transfers `isOwner` while both memberships remain active

### Voting

`POST /auth/login`, `GET /auth/user`, `GET /projects`, `POST /projects/:projectId`, `GET /sse` → `VotingService` with `Vote`, `VoteCategory`, `UserProject`. `GET /auth/user` returns `votingStartDate` and `votingEndDate` (ISO) for the active event. `GET /sse` streams `VotingEvent` payloads (`type: message | timer`) to connected jurors; staff publish via `POST /` (admin cookie). AdminJS uses the admin-cookie/internal server routes `POST /admin/voting/start`, `POST /admin/voting/stop`, `POST /admin/voting/message`, `GET /admin/voting/status`, `GET /admin/voting/results`, `POST /admin/voting/awards/generate`, `GET /admin/voting/awards`, and `POST /admin/voting/awards/:awardId/assign`. Closing voting creates one `Award` row per active participant project; category assignment marks winners, while null-category entries remain available for later certificate encouragement text. Reassignment enforces one category award per project. Results are available only after voting closes and are scoped to the requested event. The voting SPA sends `x-csrf-token` on mutating requests (same pattern as registration). Jury login uses Passport strategy `login-voting` (`VotingLoginStrategy` in `auth/local-voting.strategy.ts`) with `VotingLoginAuthGuard`; authenticated routes use `JwtVotingAuthGuard` (`auth/jwt-voting-auth.guard.ts`, `auth/local-voting-auth.guard.ts`).

Dev seed data (`apps/api/src/seeder/seed-voting-fixtures.ts`): six table-linked projects across `en` / `nl` / `fr` (e.g. Line Following Robot, Slimme Kas, Station Météo Junior). Projects must be assigned to an `EventTable` row or `GET /projects` returns `finished`. Vote categories are jury-only (`public: false`). Re-apply fixtures with `npm run seed-voting --workspace=apps/api` (clears existing votes for the `jury` account).

When `UPLOAD_ROOT` is set, `seedDatabase` also copies fixture PNGs from `apps/api/src/seeder/fixtures/project-images/` into per-project upload folders, creates confirmed `Attachment` rows, and seeds “Agree to Photo” consent for all users so event guide thumbnails appear. Re-apply pictures on an existing DB with `npm run seed-pictures --workspace=apps/api`. The API `build` script copies `src/seeder/fixtures/` into `dist/seeder/fixtures/` (required for `seed-db` from compiled output).

### Event guide

Public read-only routes on `EventguideController` (no auth):

- `GET /eventguide/projects` — projects for the active event (`InfoInterceptor.currentEvent`)
- `GET /eventguide/events/:eventId/projects` — projects for a specific event (including past events)
- `GET /eventguide/floorplans/:filename` — floor plan SVG from `UPLOAD_ROOT/floorplans/` (filename sanitized; no path traversal)
- `GET /eventguide/attachments/:attachmentId/thumbnail` — confirmed attachment thumbnail when all participants agreed to photo

Response shape: `{ event: { id, title, officialStartDate, floorplanPath }, projects: [...] }` (`EventguideProjectsResponseDto`). `floorplanPath` is API-relative (e.g. `eventguide/floorplans/cp2025_zaal.svg`). `Event.floorplanPath` in the database stores the bare filename.

### Admin floorplans

Staff-only routes on `AdminController` (`AuthGuard('mandatory-admin-cookie')` — signed `adminjs` session cookie):

- `GET /admin/floorplans` — list SVG files in `UPLOAD_ROOT/floorplans/` for the logged-in event (includes `isActive` from `Event.floorplanPath`)
- `POST /admin/floorplans` — upload and process a Visio SVG (`{ svgContent, originalName }`); writes to API disk and sets active floor plan for the event
- `POST /admin/floorplans/:filename/activate` — set `Event.floorplanPath` to an existing uploaded file

The AdminJS Floorplans page handler proxies these endpoints server-side. Visio processing lives in `apps/api/src/eventguide/process-visio-svg.ts`.

### Admin mail template context

- `POST /admin/mail-templates/context` (staff-only, same guard) — `{ recordType: 'user' | 'registration', recordId?: number }` → the Handlebars context for that record (or, without `recordId`, its first record by `id`), built by `buildMailContext` (see Email templates above) with `PREVIEW_TOKEN` in place of a real JWT. No `eventId` parameter — the record's own event decides. The AdminJS EmailTemplates page handler proxies to this route instead of building context locally.

### Shared reads

`GET /tshirts`, `GET /questions`, `GET /dojos`, `GET /settings` on `AppController` — used by registration and other frontends. `GET /dojos` returns event-scoped `Affiliation` names (CoderDojo catalog). `GET /settings` includes `maxAttachments` (currently 10; not an Event column) so the registration upload UI can cap photos without a Vue Number-prop warning.

## Out of scope / unknowns

- Full OpenAPI/Swagger route catalog (use controller source)
- Background job schedule details
- Production secrets and Azure blob configuration
- Whether other frontends send `x-csrf-token` on mutating API calls (registration and voting do)

## Status

Status: deep
