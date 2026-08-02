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

Local URL (via proxy): `https://api.coolestprojects.localhost:8443`

Key env vars (set in `.devcontainer/docker-compose.yml`): `DB_*`, `JWT_KEY`, `API_PORT`, `VOTING_KEY`, `CSRF_SECRET`, `UPLOAD_ROOT`, `FILE_*`.

## Talks to

- `packages/database` — all Sequelize models
- MySQL
- External: SMTP (mailer), Azure blob (files), Puppeteer (PDF/certs — usage TBD)

## Module map

| Module / area | Controller | Service | Role |
|---------------|------------|---------|------|
| `app` | `AppController` | `AppService` | Tshirts, questions, approvals, settings |
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

`POST /registration` → `RegistrationService` creates `User`, `Registration`, related `Question*` / `Tshirt*` records.

### Login / session

`POST /login`, `POST /login/logout`, `POST /login/mailToken` → auth cookies/JWT via `AuthModule` and `TokensService`.

### Email templates

Branded en/nl/fr copy lives in [`apps/api/src/mailer/seed-email-templates.ts`](../../apps/api/src/mailer/seed-email-templates.ts) and is inserted by `seedDatabase` in [`apps/api/src/seeder/seed.ts`](../../apps/api/src/seeder/seed.ts). After changing templates, rebuild the API and re-run `npm run seed-db --workspace=apps/api` on a fresh database (or replace `EmailTemplates` rows for the active event). In the Dev Container, captured mail appears at http://localhost:18025.

### Project management

`GET|POST|PATCH|DELETE /projectinfo` plus attachments and participant routes → `Project`, `UserProject`, `Attachment` models.

- `DELETE /projectinfo` (owner alone): sets `Project.deletedAt` and soft-deletes all active `UserProject` rows for that project; rejected when registered co-participants exist
- `POST /projectinfo/change-owner/:newOwnerId`: transfers `isOwner` while both memberships remain active

### Voting

`POST /auth/login`, `GET /projects`, `POST /projects/:projectId` → `VotingService` with `Vote`, `VoteCategory`, `UserProject`.

### Shared reads

`GET /tshirts`, `GET /questions`, `GET /settings` on `AppController` — used by registration and other frontends.

## Out of scope / unknowns

- Full OpenAPI/Swagger route catalog (use controller source)
- Background job schedule details
- Production secrets and Azure blob configuration
- CSRF enforcement scope per frontend

## Status

Status: deep
