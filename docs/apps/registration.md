# Registration app

## Purpose

Nuxt 3 SPA for participant registration, magic-link login, project management, participant invites, and attachment uploads for Coolest Projects events.

## Stack

- Nuxt 3 (SPA, `ssr: false`), Vue 3, TypeScript, Pinia, Tailwind CSS, `@nuxtjs/i18n`
- Vitest for unit/component tests
- `npm run dev` → Nuxt dev server; API proxied via `/_api`

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/registration/` | Nuxt app root |
| `npm run dev --workspace=apps/registration` | Dev server (port 3004 in Dev Container) |
| `npm run test --workspace=apps/registration` | Vitest suite |
| `npm run seed:postal-codes --workspace=apps/registration` | Regenerate `data/be-postal-codes.json` from [zipcode-belgium](https://github.com/jief/zipcode-belgium) |

Local URL (via proxy): `https://registration.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `RegistrationController`, `LoginController`, `ProjectinfoController`, `UserinfoController`, `ParticipantController`, `AppController` (`/settings`, catalogs)
- Auth: magic-link JWT → signed httpOnly `jwt` cookie (`jwt-cookiecombo`); CSRF via `GET /csrf-token` + `x-csrf-token` on mutating requests
- Attachments: multipart `POST /projectinfo/attachments`, list `GET /projectinfo/attachments`, delete `DELETE /projectinfo/attachments/:id`
- Participant invites: `POST /projectinfo/participant` returns `{ project_code }`; unused vouchers listed on `GET /projectinfo` as `pending` participants with `token`

## Key flows

1. **Landing / rules** — `GET /settings` drives event status (`no_event`, registration open/closed)
2. **Registration** — catalogs + `POST /registration`
3. **Login** — `POST /login/mailToken` → `POST /login` with JWT from email link
4. **Project** — flat `OwnProjectDto` on `GET/POST/PATCH /projectinfo`; owner CRUD + participant invite list; owner can transfer ownership via `POST /projectinfo/change-owner/:newOwnerId`; `DELETE /projectinfo` soft-deletes the project when no registered co-participants remain
5. **Upload** — owner-only `/upload`; images only (JPEG/PNG/WebP/HEIC→JPEG); client normalize + XHR multipart upload with progress; list/preview/delete via `GET/DELETE /projectinfo/attachments`
6. **Join via token (logged-in)** — `/token` or invite URL `/registration?token=<voucher>` calls `POST /participant` (`assignParticipant`); success → `/project`; reject if user already has a project or token invalid/used (no registration form, no email)

## Out of scope / unknowns

- Azure Blob `/attachments` SAS flow (replaced by multipart uploads)
- Attachment rename; video upload (UI and API video thumbnail path not supported)

## Status

Status: deep
