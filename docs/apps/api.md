# API app

## Purpose

Central NestJS HTTP API for Coolest Projects. Serves registration, login, project info, voting, event guide, presentation, and shared settings endpoints. Uses Sequelize with models from `@coolestprojects/database`.

## Stack

- NestJS 11, Express, TypeScript
- `@nestjs/sequelize`, `mysql2`
- Passport JWT/cookie auth, `@nestjs/jwt`
- Swagger (`@nestjs/swagger`), scheduled jobs (`@nestjs/schedule`)
- Mail (`nodemailer`), file upload (local disk, `UPLOAD_ROOT`), Puppeteer

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

Key env vars (set in `.devcontainer/docker-compose.yml`): `DB_*`, `JWT_KEY`, `API_PORT`, `API_BASE_URL`, `VOTING_KEY`, `CSRF_SECRET`, `COOKIE_DOMAIN`, `CORS_ORIGINS`, `UPLOAD_ROOT`, `FILE_*`, `SMTP_*`, `IMAP_HOST`/`IMAP_USER`/`IMAP_PASSWORD`/`IMAP_PORT`, `CRON_JOB_MAIL`/`CRON_JOB_BOUNCE` (see [Bounce mail detection](#bounce-mail-detection)).

## Talks to

- `packages/database` — all Sequelize models
- MySQL
- External: SMTP (mailer), IMAP (bounce polling — see [Bounce mail detection](#bounce-mail-detection)), Puppeteer (slide deck rendering — see [Presentation slide deck](#presentation-slide-deck); also PDF/certs — usage TBD)

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
| `presentation` | `PresentationController` | `PresentationService` | Slide deck generation + delta-sync API for Pi displays — see [Presentation slide deck](#presentation-slide-deck) |
| `file-upload` | `FileUploadController` | `FileUploadService` | File auth check |
| `mailer` | — | `MailerService` | Email sending (templates seeded from `apps/api/src/mailer/seed-email-templates.ts`; local capture via MailHog — see [local-setup.md](../local-setup.md)) |
| `tokens` | — | `TokensService` | Token helpers |
| `background` | — | `BackgroundService` | Cron-driven reminder mail and bounce polling (both off unless their env var is set — see [Daily reminder mail](#daily-reminder-mail) and [Bounce mail detection](#bounce-mail-detection)) |
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

`DELETE /userinfo` (`UserinfoService.deleteUser`) hard-deletes the `User` row (no `paranoid` mode). It sends `MailerService.accountDeletedMail` — a `MailTemplates.accountDeleted` farewell mail, explicitly the last one they'll get, with no login link — *before* destroying the row; a send failure is logged but never blocks the deletion.

`UserCookieInterceptor` refreshes the participant `jwt` cookie on authenticated responses. Routes that also accept the AdminJS session cookie (`GET /projectinfo/attachments/:id`, `GET /projectinfo/attachments/original/:id`) can resolve to an admin principal without a participant id; the interceptor skips those so an open admin session in the same browser cannot overwrite a participant session.

### Email templates

Branded en/nl/fr copy lives in [`apps/api/src/mailer/seed-email-templates.ts`](../../apps/api/src/mailer/seed-email-templates.ts) and is inserted by `seedDatabase` in [`apps/api/src/seeder/seed.ts`](../../apps/api/src/seeder/seed.ts). After changing templates, rebuild the API and re-run `npm run seed-db --workspace=apps/api` on a fresh database (or replace `EmailTemplates` rows for the active event). In the Dev Container, captured mail appears at http://localhost:18025.

All Handlebars context passed to a template — for a real send and for an admin preview alike — is built by the single `buildMailContext` function in [`apps/api/src/mailer/mail-context.ts`](../../apps/api/src/mailer/mail-context.ts). It takes the raw `User` or `Registration` Sequelize record directly (no separate DTO/interface stands in for it) and nests it under `context.user` or `context.registration` — which one is recognised from the record's own class via `instanceof`, never passed in separately, so it can't drift from the actual record. `MailerService` is the only place that ever supplies a *real* token (minted by `TokensService` at send time) — `buildMailContext` itself never generates one.

`buildMailContext` resolves the Event itself, internally, via `resolveMailEvent(person)`, which calls the record's own `getEvent()` association getter (`BaseEventModel.getEvent` in [`packages/database`](../../packages/database/src/models/base_event.model.ts) — sequelize-typescript's generated `@BelongsTo` accessor, typed explicitly there) — never "whichever event is currently active" or an admin session's selected event. A participant's event can be over and they must still be able to receive mail for it (e.g. a login link), so no caller (`MailerService`, `AdminService`) ever resolves or passes in an `Event` or an `eventModel` itself; they get the resolved `Event` back (alongside `context`) for anything else they still need it for, like looking up which template to send.

Admin previews reuse the exact same function through a staff-only endpoint, `POST /admin/mail-templates/context` (`AdminController` / `AdminService.getMailTemplateContext`, guarded by `MandatoryAdminCookieGuard`). There is no `eventId` parameter — an admin's currently selected event has no bearing on which record can be previewed. Given `{ recordType, recordId }` it loads the real `User`/`Registration` (plus their owned `Project` for user records) and calls `buildMailContext` with `PREVIEW_TOKEN`, a fixed placeholder string — never a real JWT. `recordType` is required (the AdminJS page always knows it from the template, via `getContextRecordType`); without `recordId` it loads the first record of that kind (lowest `id`) instead of a synthetic placeholder, so a preview always renders a real Event too. If no record of that kind exists yet, the endpoint 404s. The AdminJS **EmailTemplates** page handler proxies to this endpoint via `NestApiClient` rather than rebuilding the context locally — see [admin.md](admin.md).

### Daily reminder mail

`BackgroundService.handleMailing()` (`apps/api/src/background/background.service.ts`) — off unless `CRON_JOB_MAIL` is set; no-ops outside an active event window, same gate as bounce checking above. Sends **at most one combined reminder email per recipient per calendar day**, regardless of how often the cron fires:

- **User-scoped reasons** (`noProject`, `noPhoto`, `deadlineApproaching`) are derived per user by [`deriveReminderReasons`](../../apps/api/src/background/reminder-reasons.ts) — a pure function (covered by `reminder-reasons.spec.ts`) fed by a single query joining each user's active `projects` and their `attachments`. `noPhoto` is only ever set when the user actually has a project; a plain "does this user have zero attachments" check can't tell "no project" and "project with no photo" apart (both produce `NULL` through the same `LEFT JOIN` chain), so deriving it in JS from the loaded association data — rather than in the query's `WHERE` — is what keeps the two mutually exclusive. `deadlineApproaching` (true for the 7 days before `Event.projectClosedDate`) applies to every user regardless of the other two, by design — it's a blanket nudge, not conditional on being otherwise incomplete. A user with no reasons at all is skipped. Everyone else gets one `MailerService.sendDailyReminderMail(user, reasons, token)` call — one template (`MailTemplates.dailyReminder`), with `{{#if noProject}}`/`{{#if noPhoto}}`/`{{#if deadlineApproaching}}` sections in the Handlebars copy so only the applicable parts render — plus a login link (`TokensService.generateLoginToken`).
- **Registration reminders** (people who registered but never activated, i.e. still have a `Registration` row after 7 days) are a structurally separate, single-reason flow — `Registration` and `User` rows never coexist for the same person (activation creates the `User` and hard-deletes the `Registration` in one transaction) — so there's no overlap with the reasons above. `MailerService.sendRegistrationReminderMail(registration, token)` uses its own template (`MailTemplates.registrationReminder`). Excludes `waiting_list: true` registrations — see below, they were never sent an activation link so a "don't forget to activate" reminder would be nonsensical.
- **Once-per-day cap**: `BackgroundService.alreadySentToday(template, {userId | registrationId})` checks `EmailLog` for a row with that template/recipient created since local midnight before sending — the same "`EmailLog` as source of truth" approach bounce detection already uses, so it works no matter how often `CRON_JOB_MAIL` fires (there's no separate schedule-based guarantee of "once a day").
- **Waiting-list promotion** runs first, before the reasons/reminders above: `RegistrationService.promoteWaitingList(eventId)` recomputes free capacity (`Event.maxRegistration - (activeProjectCount + confirmedPendingRegistrationCount)` — deliberately excluding currently-waitlisted rows from the consumed count, the opposite question from the waitlist check at signup time in `RegistrationService.create()`, which counts everyone) and, if any slots are free, promotes that many waitlisted `Registration` rows oldest-first (`order: createdAt ASC`), flips `waiting_list` to `false`, and sends each the same real `registrationMail` (with an activation token) a normal signup gets — fulfilling the promise already in the waiting-list mail's own copy ("once a spot opens up, you'll get an activation mail"). Slots free up in practice only when a `Project` is soft-deleted; there's no expiry for stale, never-activated registrations. Runs inside a transaction with the same `Event`-row locking `create()` uses, so it can't race a concurrent registration; mail failures are logged, never undo the promotion (same pattern as the other post-transaction sends in `RegistrationService`).

**Suggested improvement — not implemented — registration cleanup driven by reminder count.** Because there's no expiry mechanism, a `Registration` that never activates sits forever, permanently counting toward `event.maxRegistration` (see above) — the only thing that currently frees a slot is an owner deleting their whole project. A registration that's received several `registrationReminder` mails with no resulting activation is a reasonable signal that the person isn't coming back. This could be built without a schema change: `EmailLog` already has everything needed (`EmailLog.count({ where: { template: MailTemplates.registrationReminder, registrationId, status: 'sent' } })` per registration), so a reminder count doesn't need its own column. A follow-up cron step could then, for registrations past some threshold (e.g. 3+ reminders and still not activated), either hard-delete the `Registration` row (mirroring the one existing `registrationModel.destroy` call, in `activateRegistration`) or flag it for admin review before deleting — deleting frees the slot for `promoteWaitingList` on the very next run. Worth deciding deliberately whether stale registrations are auto-deleted or just surfaced to staff, since deleting is irreversible and the person might still show up.

### Bounce mail detection

`BackgroundService` (`apps/api/src/background/background.service.ts`) polls an IMAP mailbox for bounce notifications and marks the matching `EmailLog` row `status: 'bounced'`. **This is disabled by default** — it only runs if `CRON_JOB_BOUNCE` (a cron expression, e.g. `*/5 * * * *`) is set; `onModuleInit` only registers the `bouncing-job` with `SchedulerRegistry` when that env var is present. Like `handleMailing` (the reminder-mail job driven by the separate `CRON_JOB_MAIL`), it also no-ops whenever there's no event with `eventBeginDate < now < eventEndDate` — bounce checking pauses outside an active event window.

Each run (`handleBounce`):

1. Connects over IMAP (`node-imap`, TLS with `rejectUnauthorized: true`) and opens `INBOX`.
2. Searches for `UNSEEN` messages, fetches and parses each with `mailparser`'s `simpleParser`.
3. For every parsed message, `isBounceNotification` ([`apps/api/src/background/bounce-detection.ts`](../../apps/api/src/background/bounce-detection.ts)) gates it: true if it carries a `message/delivery-status` MIME part (present on every RFC 3464 DSN — Gmail, Outlook/Microsoft 365, and Yahoo all send this) or if it's from a `mailer-daemon@…`/`postmaster@…` address (for non-standard bounce generators that skip the full DSN structure). Anything else — a genuine reply, an out-of-office autoresponder — is skipped rather than risk a false positive.
4. `extractBounceIdentifier` (same file) ties the notification back to the send it's for, trying in order: the `In-Reply-To` header; the first `References` entry; the `Message-ID` inside the embedded original-message part (`message/rfc822`/`text/rfc822-headers` — what a standards-compliant DSN from Gmail/Outlook/Yahoo actually carries; `mailparser` exposes this via `mail.attachments`, not `mail.text`); finally a regex over the human-readable body text as a last resort.
5. Looks up `EmailLog.findOne({ where: { messageId } })` using whatever identifier (if any) was found.
   - No match → the message is skipped (left in the mailbox). Because the IMAP fetch used `markSeen: true`, it's now `\Seen` and **will not be picked up by a later run either** — unmatched mail silently accumulates in the mailbox rather than being retried, deleted, or flagged for review.
   - Match → sets `EmailLog.status = 'bounced'`, stores the full bounce body in `EmailLog.error` (overloading the same column send-failure exceptions use), saves, then deletes the message from the mailbox (`\Deleted` flag + `expunge`) — only after the DB write succeeds.

`EmailLog.status` is `'sent' | 'failed' | 'bounced'` ([`packages/database/src/models/email_log.model.ts`](../../packages/database/src/models/email_log.model.ts)) — there's no hard/soft-bounce distinction, no bounce timestamp, and no suppression: nothing in `MailerService` checks `EmailLog.status === 'bounced'` before sending to an address again.

**Env vars** (`apps/api/src/config/configuration.ts`, `mailing.*`): `IMAP_HOST`, `IMAP_USER`, `IMAP_PASSWORD`, `IMAP_PORT` (default `993`). `IMAP_HOST` is separate from `SMTP_HOST` — the mailbox you read bounces *from* is often not the relay you send *through* (a transactional-mail provider, `mailhog`/`Mailpit`, etc. typically has no IMAP server at all). If `IMAP_HOST` is unset it falls back to `SMTP_HOST`, for setups where the same mailbox genuinely does both (e.g. a single Google Workspace/M365 mailbox). Set `IMAP_HOST` explicitly whenever that's not the case, or `getOrThrow` will throw immediately every run — caught and logged as `'Failed to check bounce mailbox'`. Confirm what `mail-prod` (see [architecture.md](../architecture.md#production-level27)) actually is, and set `IMAP_HOST` accordingly, before enabling `CRON_JOB_BOUNCE` in production.

**Coverage for Gmail / Outlook (Microsoft 365) / Yahoo specifically.** `isBounceNotification`/`extractBounceIdentifier` were written specifically to handle the RFC 3464 DSN shape these three send (the `message/delivery-status` gate and the `message/rfc822`/`text/rfc822-headers` original-message extraction, both covered by [`bounce-detection.spec.ts`](../../apps/api/src/background/bounce-detection.spec.ts) with fixtures shaped like each). What this still doesn't cover:

- **Not validated against real bounce samples.** The tests use hand-built `ParsedMail` fixtures matching the documented RFC 3464 structure, not actual bounce emails captured from Gmail, Outlook/M365, or Yahoo — there's no way to do that without live mail flow (see the local-dev and `mail-prod` caveats above). Confirm against real samples once IMAP access to a real bounce mailbox is available.
- **`References` being a single string rather than an array is now handled** (`mailparser` returns a bare string, not a one-element array, when only one reference exists) — the previous version indexed into it with `references[0]`, silently returning the first *character* of the string instead of the reference itself, in that case.
- Microsoft's NDRs tend to put more diagnostic text (including original headers) directly in the human-readable body, so the plaintext-regex fallback may still catch some Outlook/M365 bounces that don't even need the attachment-scanning path; that's not something Gmail's or Yahoo's terser DSNs are expected to rely on.

**Local dev:** bounce checking cannot be exercised in the Dev Container — `mailhog` (the local SMTP catcher, see [local-setup.md](../local-setup.md)) has no IMAP server. `CRON_JOB_BOUNCE` and `IMAP_HOST`/`IMAP_USER`/`IMAP_PASSWORD`/`IMAP_PORT` are present as commented-out examples in `.devcontainer/docker-compose.yml` — point them at a real IMAP-capable mailbox to test against real mail.

**Tests:** the bounce/DSN-parsing logic (`isBounceNotification`, `extractBounceIdentifier`) lives in [`apps/api/src/background/bounce-detection.ts`](../../apps/api/src/background/bounce-detection.ts), covered by [`bounce-detection.spec.ts`](../../apps/api/src/background/bounce-detection.spec.ts) — extracted out of `BackgroundService` specifically so this parsing logic is unit-testable without an IMAP connection or full Nest DI. `apps/api/src/background/background.service.spec.ts` itself is still the unmodified Nest CLI scaffold (`should be defined`, no constructor mocks) — the IMAP wiring (`getBounceMessages`, `deleteMessage`) and the `handleBounce`/`handleMailing` orchestration remain untested.

### Project management

`GET|POST|PATCH|DELETE /projectinfo` plus attachments and participant routes → `Project`, `UserProject`, `Attachment` models.

- `DELETE /projectinfo/attachments/:id` (owner): removes a photo unless `confirmed` or `internal` is true; `null` counts as unconfirmed so seeded and newly uploaded files can be deleted

- `DELETE /projectinfo` (owner alone): sets `Project.deletedAt` and soft-deletes all active `UserProject` rows for that project; rejected when registered co-participants exist
- `POST /projectinfo/change-owner/:newOwnerId`: transfers `isOwner` while both memberships remain active

The project owner is notified by mail on both sides of participant membership changes, via `Project.getOwner()` (`packages/database/src/models/project.model.ts` — finds the active `isOwner: true` `UserProject` row): `RegistrationService.activateRegistration()` sends `MailerService.notifyProjectOwner` (`MailTemplates.notifyNewProjectOwner`) right after a co-worker's voucher activation; `RegistrationService.unassignParticipant()` (`DELETE /participant/:id`, `ParticipantController`) sends `notifyProjectOwnerParticipantLeft` (`MailTemplates.notifyProjectParticipantLeft`) after a co-worker removes themselves. Both are best-effort — logged, never thrown — same as every other post-transaction mail send in `RegistrationService`; a project with no owner (shouldn't happen, but `getOwner()` can return `undefined`) simply skips the notification.

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
- `POST /admin/floorplans` — upload and process a Visio SVG; real `multipart/form-data` (`FileInterceptor('file')`, `@UploadedFile()` — no size limit), not a JSON body. Writes to API disk and sets active floor plan for the event. See [Admin file uploads](#admin-file-uploads) for how the multipart request gets from an AdminJS page to this route.
- `POST /admin/floorplans/:filename/activate` — set `Event.floorplanPath` to an existing uploaded file
- `DELETE /admin/floorplans/:filename` — delete an uploaded file. Floor plans are a **shared pool**, not per-event (`getFloorplanDir()` has no event subdir — `Event.floorplanPath` just points at whichever shared file an event is using), so this rejects (400) if *any* event — not just the logged-in one — still has this filename as its `floorplanPath`, to avoid silently orphaning another event's active map. ENOENT-tolerant otherwise.

The AdminJS Floorplans page handler proxies these endpoints server-side. Visio processing lives in `apps/api/src/eventguide/process-visio-svg.ts`.

### Admin mail template context

- `POST /admin/mail-templates/context` (staff-only, same guard) — `{ recordType: 'user' | 'registration', recordId?: number }` → the Handlebars context for that record (or, without `recordId`, its first record by `id`), built by `buildMailContext` (see Email templates above) with `PREVIEW_TOKEN` in place of a real JWT. No `eventId` parameter — the record's own event decides. The AdminJS EmailTemplates page handler proxies to this route instead of building context locally.

### Presentation slide deck

`PresentationController`/`PresentationService` (`apps/api/src/presentation/`) render a slide deck to PNGs (Handlebars → HTML → Puppeteer screenshot) and expose it over a small delta-sync API built for Raspberry Pi devices on unreliable connections: a cheap global listing with a content hash per slide, and a per-slide image fetch that's cache-friendly (`ETag`/`Last-Modified`, `HEAD`, conditional `GET`).

**Slides are admin-configured, not hardcoded.** Every slide — event info, per-project, project overview, floor map, sponsor/custom — is one `PresentationSlide` row (event-scoped, managed via the AdminJS **Presentation** resource), ordered by its own `order` column:
- `dataSource: 'none' | 'projects'` — what feeds the Handlebars `body`. Event fields (`eventTitle`, dates) and `year`/`website` are always in context regardless of `dataSource`, so an event-info slide or a floor-map slide (referencing `event.floorplanPath`) are just ordinary `'none'` rows the admin authors — no dedicated code path for either.
- `cardinality: 'single' | 'perRecord'` — only meaningful with `dataSource: 'projects'`. `perRecord` expands into **one rendered slide per visible project** (`record` in context) — the per-project "explanation + room location" slide. `single` produces **one** slide with every visible project as `records` — the project-overview style. `'none'` rows are always effectively single.
- `imagePath` — optional static art for a `'none'` slide (e.g. a sponsor backdrop), uploaded via `POST /admin/presentation-slides/:id/image` (multipart, see [Admin file uploads](#admin-file-uploads)) to `UPLOAD_ROOT/presentations/<eventId>/`. Plain file, **not** an `Attachment` row — same for the rendered slide PNGs themselves. No AdminJS upload widget yet; staff use the API endpoint directly (or a future admin page) — a known, deliberately-deferred gap, not an oversight.

Dev seed data (`apps/api/src/seeder/seed-presentation-slides.ts`, applied by `seedDatabase`): three `PresentationSlide` rows styled after `apps/eventguide`'s branding (teal `#00AEA9`, `#f5f7fa` hero background) — an "All projects overview" (`projects`/`single`), a "Project spotlight" (`projects`/`perRecord`, one slide per visible project with photo/name/description/table badge), and a "Thank you sponsors" (`none`) slide demonstrating the `{{lookup assets 'filename.png'}}` pattern (see [Presentation assets](#presentation-assets) below), falling back to placeholder text when no logo has been uploaded yet.

**Project visibility is table-assignment-gated — the opposite of the event guide.** The "visible projects" data source only includes projects with an `EventTable` row (`required: true` on that include); a project with no table assignment is hidden from the deck entirely. `eventguide`'s equivalent query uses `required: false` (shows every project, `tableNumber: null` if unassigned) — these are deliberately different rules for different audiences, not shared code. Ordered by table number then name (same convention as `eventguide`). The project's image is just its first confirmed `Attachment` — no photo-consent gate; that's specific to the event guide's public-online use case and doesn't apply to a venue-only display.

**Hashing stays cheap.** A slide's hash is `sha256` of its `body` + `imagePath` + the exact (DB-only) data feeding it — computing every slide's hash for the list endpoint never touches Puppeteer or the filesystem. `PresentationRender` is the render-cache index (one row per rendered slide key, `contentHash` + `imagePath` + `generatedAt`); a request only renders when the freshly computed hash doesn't match the cached one. `HEAD /presentation/:key` deliberately isn't left to Express's auto-derived `HEAD`-from-`GET` (which would run the full render-if-stale path) — it calls a hash-only lookup that never renders.

**Auth**: HTTP Basic, backed by a dedicated `Account.account_type: 'presentation'` (`PresentationBasicStrategy`/`PresentationAuthGuard`, `apps/api/src/auth/`) — stateless, so a Pi that drops offline just retries the same static `Authorization` header, no session/token refresh. Not public.

- `GET /presentation` → `{ slides: [{key, order, time, hash, generatedAt}], hash }` (deck-level rollup hash for a single cheap "did anything change" check).
- `GET /presentation/:key` → the PNG; `ETag`/`Last-Modified` set; honors `If-None-Match` with a `304` before doing any work.
- `HEAD /presentation/:key` → same headers, no body, never renders.

Slide keys are stable strings (`slide-<configId>` or `slide-<configId>-<projectId>`), not array indices — indices would silently point at the wrong slide once a project is added/removed.

### Presentation assets

Logos/art an admin uploads for reuse **across** slides (as opposed to a single slide's own `imagePath`), managed via the AdminJS **Presentation assets** page. Staff-only routes on `AdminController`, same guard as floorplans:

- `GET /admin/presentation-assets` — list files (filename + `uploadedAt`) under `UPLOAD_ROOT/presentations/<eventId>/assets/`
- `POST /admin/presentation-assets` — upload (multipart, see [Admin file uploads](#admin-file-uploads)); filename is derived from the uploaded file's mimetype, not trusted from the client
- `DELETE /admin/presentation-assets/:filename` — delete (ENOENT-tolerant)

A slide's Handlebars `body` references an uploaded asset with `{{lookup assets 'logo.png'}}` (Handlebars' built-in `lookup` helper), e.g. `<img src="{{lookup assets 'logo.png'}}">` — `assets` is a `{ filename: dataUri }` map `PresentationService` builds from that folder at render time (`loadAssetsContext`). No `Attachment` row, same plain-filesystem convention as `imagePath`.

Only browser/Chromium-decodable image formats are accepted (`png`/`jpg`/`jpeg`/`webp`/`gif`/`svg`, mimetype-checked) — not because of `feh` (the Pi only ever downloads the final rendered PNG, see [presentation.md](presentation.md), never a raw asset file), but because the asset is inlined as a `data:` URI into HTML that Puppeteer/Chromium has to actually decode to render the slide. No size limit — gated by admin/super_admin auth, same as the other admin uploads.

**Keeping the hot poll path cheap.** `GET /presentation`'s per-slide hash (used by every Pi's delta-sync poll — see above) folds in an `assetsFingerprint`: a hash of the assets folder's filenames/mtimes/sizes only, *not* file contents, so a change to any asset invalidates every slide's cache (assets are shared across the whole deck, body is free-form Handlebars so there's no way to know which slides reference which asset) without the hot list/meta path paying to read and base64-encode every logo on every poll. The full `{ filename: dataUri }` map (`loadAssetsContext`) is only ever built on an actual render — a cache miss or an admin preview — never on the list/meta path.

### Admin file uploads

Every staff file upload (floorplan SVG, a slide's own `imagePath`, presentation assets) reaches these routes as real `multipart/form-data` — `FileInterceptor('file')` + `@UploadedFile()`, same mechanism `projectinfo`'s participant attachment upload uses — **not** a JSON body with base64-encoded content. Two differences from the participant upload:

- **No size limit and no `FileValidationInterceptor`.** The participant-facing attachment route validates `file.size`/`file.mimetype` against the uploader's `Event.maxFileSize`/`allowedMimeTypes` because it's exposed to a much less trusted caller. Admin uploads are gated by `MandatoryAdminCookieGuard` (admin/super_admin auth) alone; content is trusted, though floorplan/asset routes still enforce their own *functional* checks (valid SVG structure, a Chromium-decodable image format) — see the sections above.
- **The request is multipart before it even reaches this app.** AdminJS's own Express router already parses every page-handler POST as multipart via `express-formidable` (`@adminjs/express`'s `buildRouter.js` wraps the whole router in it) — the AdminJS page handler in `apps/admin` reads the parsed file (`payload.file`, spooled to a temp path) and re-encodes it once into a real multipart request (`form-data` package) via `NestApiClient.postForm()`, forwarding it to the routes above. See [admin.md](admin.md#file-uploads) for that side. `buildAuthenticatedRouter`'s `formidableOptions` is set to `{ maxFileSize: Infinity }` in `apps/admin/src/index.ts` so formidable's own 200MB default doesn't reintroduce a cap.

### Admin presentation preview

Staff-only bridge routes on `AdminController` (same `mandatory-admin-cookie` guard as floorplans/mail-template-context) that call `PresentationService` directly, since `PresentationAuthGuard` (HTTP Basic, for Pi devices) can't be satisfied by the admin's cookie session:

- `GET /admin/presentation-slides/preview` — the same `{ slides, hash }` shape `GET /presentation` returns, for the AdminJS carousel.
- `GET /admin/presentation-slides/preview/projects` — visible-project `{id, name}` options, for the perRecord quick-edit picker.
- `GET /admin/presentation-slides/preview/:key/image` — the real, cached-or-rendered slide PNG (`ETag`/`Last-Modified` set) — the AdminJS page's `<img>` fetches this directly, cookie sent automatically, same pattern as `PictureSelector`'s attachment thumbnails.
- `POST /admin/presentation-slides/preview/draft` — `{ slideId, body, projectId? }` renders an **unsaved** `body` override against the slide's real saved `dataSource`/`cardinality`/`imagePath` and real project data, returning `{ imageBase64 }`. Deliberately bypasses `PresentationRender` and never writes to disk — a throwaway render for the admin's edit→look→adjust loop, not part of the Pi-facing cache.

The AdminJS **Presentation** page's handler reads `PresentationSlide` rows directly (own DB connection, no business logic involved) for the quick-edit selector, and proxies only the routes above.

### Shared reads

`GET /tshirts`, `GET /questions`, `GET /dojos`, `GET /settings` on `AppController` — used by registration and other frontends. `GET /dojos` returns event-scoped `Affiliation` names (CoderDojo catalog). `GET /settings` includes `maxAttachments` (currently 10; not an Event column) so the registration upload UI can cap photos without a Vue Number-prop warning.

## Out of scope / unknowns

- Full OpenAPI/Swagger route catalog (use controller source)
- Production cron schedule values (`CRON_JOB_MAIL`/`CRON_JOB_BOUNCE`) and whether bounce checking is actually enabled there — the mechanism is documented under [Bounce mail detection](#bounce-mail-detection), the deployed values are not
- Whether `mail-prod` ([architecture.md](../architecture.md#production-level27)) is a real IMAP-capable mailbox — bounce polling needs one and this hasn't been confirmed
- Real-world Gmail/Outlook (Microsoft 365)/Yahoo bounce coverage — not verified against actual bounce samples (see [Bounce mail detection](#bounce-mail-detection))
- Production secrets
- Whether other frontends send `x-csrf-token` on mutating API calls (registration and voting do)
- No AdminJS upload widget for a single slide's own `imagePath` yet — the multipart API endpoint exists (`POST /admin/presentation-slides/:id/image`), a proper admin page (mirroring Floorplans/Presentation assets) is a deliberate follow-up, not built in this pass. The shared logos folder (Presentation assets, see [Presentation assets](#presentation-assets)) does have a page.
- Real Raspberry Pi display client — `apps/presentation` is still a placeholder; whether the actual Pi-side client lives in this monorepo or elsewhere is undecided (see [presentation.md](presentation.md))

## Status

Status: deep
