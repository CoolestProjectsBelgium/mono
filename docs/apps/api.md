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

Local URL (via proxy): `https://api.coolestprojects.localhost:8443`

Security bootstrap ([`apps/api/src/main.ts`](../../apps/api/src/main.ts), [`bootstrap-security.ts`](../../apps/api/src/bootstrap-security.ts)): [Helmet](https://docs.nestjs.com/security/helmet) for HTTP headers; [CORS](https://docs.nestjs.com/security/cors) via `app.enableCors()` when `CORS_ORIGINS` is set (comma-separated registration/voting origins, `credentials: true`). CSRF uses `csrf-csrf` double-submit: `GET /csrf-token` plus `x-csrf-token` on mutating requests. The HMAC is bound to the `anonId` cookie, whose `Domain` comes from `COOKIE_DOMAIN` (not `NODE_ENV`).

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

`POST /registration` is public: `OptionalAdminCookieGuard` attaches an admin principal when a valid AdminJS cookie is present, but a missing or invalid cookie must not 401. `RegistrationService` creates `User`, `Registration`, related `Question*` / `Tshirt*` records.

### Login / session

`POST /login`, `POST /login/logout`, `POST /login/mailToken` → auth cookies/JWT via `AuthModule` and `TokensService`.

Registration confirmation emails contain a JWT with `registrationID`. The first `POST /login` activates the registration (creates `User`, deletes the pending `Registration` row) and sets the session cookie. A second request with the same JWT returns **409** (`Registration already activated`) and does not create a session — the client should show “already confirmed” copy and offer `POST /login/mailToken` for a separate login JWT (`userID`). Invalid or expired JWTs return **401**.

`PATCH /userinfo` updates the profile but never writes `User.email`: the address is the login identity for magic-link auth.

`UserCookieInterceptor` refreshes the participant `jwt` cookie on authenticated responses. Routes that also accept the AdminJS session cookie (`GET /projectinfo/attachments/:id`, `GET /projectinfo/attachments/original/:id`) can resolve to an admin principal without a participant id; the interceptor skips those so an open admin session in the same browser cannot overwrite a participant session.

### Email templates

Branded en/nl/fr copy lives in [`apps/api/src/mailer/seed-email-templates.ts`](../../apps/api/src/mailer/seed-email-templates.ts) and is inserted by `seedDatabase` in [`apps/api/src/seeder/seed.ts`](../../apps/api/src/seeder/seed.ts). After changing templates, rebuild the API and re-run `npm run seed-db --workspace=apps/api` on a fresh database (or replace `EmailTemplates` rows for the active event). In the Dev Container, captured mail appears at http://localhost:18025.

### Project management

`GET|POST|PATCH|DELETE /projectinfo` plus attachments and participant routes → `Project`, `UserProject`, `Attachment` models.

- `DELETE /projectinfo/attachments/:id` (owner): removes a photo unless `confirmed` or `internal` is true; `null` counts as unconfirmed so seeded and newly uploaded files can be deleted

- `DELETE /projectinfo` (owner alone): sets `Project.deletedAt` and soft-deletes all active `UserProject` rows for that project; rejected when registered co-participants exist
- `POST /projectinfo/change-owner/:newOwnerId`: transfers `isOwner` while both memberships remain active

### Voting

`POST /auth/login`, `GET /projects`, `POST /projects/:projectId` → `VotingService` with `Vote`, `VoteCategory`, `UserProject`. The voting SPA sends `x-csrf-token` on mutating requests (same pattern as registration). Jury login uses Passport strategy `login-voting` (`VotingLoginStrategy` in `auth/local-voting.strategy.ts`) with `VotingLoginAuthGuard`; authenticated routes use `JwtVotingAuthGuard` (`auth/jwt-voting-auth.guard.ts`, `auth/local-voting-auth.guard.ts`).

Dev seed data (`apps/api/src/seeder/seed-voting-fixtures.ts`): six table-linked projects across `en` / `nl` / `fr` (e.g. Line Following Robot, Slimme Kas, Station Météo Junior). Projects must be assigned to an `EventTable` row or `GET /projects` returns `finished`. Vote categories are jury-only (`public: false`). Re-apply fixtures with `npm run seed-voting --workspace=apps/api` (clears existing votes for the `jury` account).

### Shared reads

`GET /tshirts`, `GET /questions`, `GET /dojos`, `GET /settings` on `AppController` — used by registration and other frontends. `GET /dojos` returns event-scoped `Affiliation` names (CoderDojo catalog). `GET /settings` includes `maxAttachments` (currently 10; not an Event column) so the registration upload UI can cap photos without a Vue Number-prop warning.

## Out of scope / unknowns

- Full OpenAPI/Swagger route catalog (use controller source)
- Background job schedule details
- Production secrets and Azure blob configuration
- Whether other frontends send `x-csrf-token` on mutating API calls (registration and voting do)

## Status

Status: deep
