# Registration app

## Purpose

Nuxt 3 SPA for participant registration, magic-link login, project management, participant invites, and attachment uploads for Coolest Projects events.

## Stack

- Nuxt 3 (SPA, `ssr: false`), Vue 3, TypeScript, Pinia, Tailwind CSS, `@nuxtjs/i18n`
- Vitest for unit/component tests
- `npm run dev` → Nuxt dev server; API at `API_BASE_URL` (default `https://api.coolestprojects.localhost:8443`)

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/registration/` | Nuxt app root |
| `npm run dev --workspace=apps/registration` | Dev server (port 3004 in Dev Container) |
| `npm run test --workspace=apps/registration` | Vitest suite |
| `npm run seed:postal-codes --workspace=apps/registration` | Regenerate `data/be-postal-codes.json` from [zipcode-belgium](https://github.com/jief/zipcode-belgium) |
| `npm run seed:dojos --workspace=apps/registration` | Regenerate `data/be-dojos.json` from map marker titles on [coderdojobelgium.be/nl/dojos](https://coderdojobelgium.be/nl/dojos) |

Local URL (via proxy): `https://registration.coolestprojects.localhost:8443`

Header home link is the Coolest Projects Belgium mark (`public/logo-coolest-projects-belgium.png`), 80px in the sticky header. Tab icons are the CoderDojo Belgium pack (`favicon.ico`, 16×16, 32×32, apple-touch) in `public/`.

## Talks to

- `apps/api` at `https://api.coolestprojects.localhost:8443` — `RegistrationController`, `LoginController`, `ProjectinfoController`, `UserinfoController`, `ParticipantController`, `AppController` (`/settings`, catalogs); cross-origin with `credentials: 'include'` (API `CORS_ORIGINS`)
- Auth: magic-link JWT → signed httpOnly `jwt` cookie (`jwt-cookiecombo`); CSRF via `GET /csrf-token` + `x-csrf-token` on mutating requests
- Affiliation: three radios on `UserForm` (CoderDojo, other organisation, not applicable). Dojo names are a committed snapshot without the `Dojo` prefix (`data/be-dojos.json`); refresh with `npm run seed:dojos`. Stored on `User`/`Registration` as `via_type` + `via` (`via_type` null = not applicable).
- Attachments: multipart `POST /projectinfo/attachments`, list `GET /projectinfo/attachments`, delete `DELETE /projectinfo/attachments/:id`. Photo count cap is `GET /settings` `maxAttachments` (API default 10); the upload page falls back to that same default if the field is missing.
- Participant invites: `POST /projectinfo/participant` returns `{ project_code }`; unused vouchers listed on `GET /projectinfo` as `pending` participants with `token`

## Key flows

1. **Landing / rules** — `GET /settings` drives event status (`no_event`, registration open/closed)
2. **Registration** — catalogs + `POST /registration`; optional affiliation (`via_type` + `via`) for CoderDojo, another organisation, or not applicable
3. **Login** — `POST /login/mailToken` → `POST /login` with JWT from email link → `/project` (or `/no_project` if the user has none)
4. **Project** — flat `OwnProjectDto` on `GET/POST/PATCH /projectinfo`; owner CRUD + participant invite list (copy invite link/token, change owner; no remove from the list); owner can transfer ownership via `POST /projectinfo/change-owner/:newOwnerId`; `DELETE /projectinfo` soft-deletes the project when no registered co-participants remain. If `GET /projectinfo/attachments` is empty, the page shows a red reminder to upload photos before `projectClosedDate`.
5. **Upload** — owner-only `/upload`; images only (JPEG/PNG/WebP/HEIC→JPEG); client normalize + XHR multipart upload with progress; list/preview/delete via `GET/DELETE /projectinfo/attachments`. Owners can delete unconfirmed photos (`confirmed` false or null); admin-confirmed files stay locked.
6. **Join via token (logged-in)** — `/token` or invite URL `/registration?token=<voucher>` calls `POST /participant` (`assignParticipant`); success → `/project`; reject if user already has a project or token invalid/used (no registration form, no email)
7. **Profile** — `/user` loads `GET /userinfo` and saves with `PATCH /userinfo` via the shared `UserForm` (`lock-email`); the email field is disabled because it is the login identity, and the API ignores email changes

## Out of scope / unknowns

- Azure Blob `/attachments` SAS flow (replaced by multipart uploads)
- Attachment rename; video upload (UI and API video thumbnail path not supported)

## Status

Status: deep
