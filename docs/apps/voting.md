# Voting app

## Purpose

Nuxt 3 SPA for Coolest Projects Belgium jury voting. Jurors log in, pick project languages to review, score one random unrated project at a time (with skip), and see a finished screen when no projects remain for the current language filter.

Converted from the legacy [coolestproject-voting](https://github.com/CoolestProjectsBelgium/coolestproject-voting) Nuxt 2 app; same flow, Nuxt 3 + Tailwind (registration-style shell), backed by the monorepo API.

## Stack

- Nuxt 3, Vue 3, TypeScript (SPA: `ssr: false`)
- Tailwind CSS — same design tokens as registration (`primary` `#00AEA9`, `AppHeader` / `AppFooter` shell)
- Pinia with persisted state (`language`, `project`, `auth` stores)
- Vitest (`@nuxt/test-utils`)

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/voting/pages/login.vue` | Jury username/password login |
| `apps/voting/pages/language.vue` | Project language filter (`nl`, `fr`, `en`) |
| `apps/voting/pages/index.vue` | Score / skip current project |
| `apps/voting/pages/finished.vue` | All projects voted for current filter |
| `apps/voting/composables/useAuth.ts` | Login session (Pinia JWT) |
| `apps/voting/composables/useApiClient.ts` | API fetch + CSRF + Bearer auth |
| `apps/voting/nuxt.config.ts` | Nuxt configuration |
| `npm run dev --workspace=apps/voting` | Dev server (port 3005 in Dev Container) |

Local URL (via proxy): `https://voting.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `VotingController` at **root paths** (no `/voting` prefix):
  - `POST /auth/login` — body `{ username, password }` → `{ jwt }`
  - `GET /auth/user` — Bearer JWT → `{ id, email, eventId }`
  - `POST /auth/logout`
  - `GET /languages` → `[{ id, text }]`
  - `GET /projects?languages=<json>&skipProject=<json>` → project DTO or `{ message: 'finished' }`
  - `POST /projects/:projectId` — body `[{ id, value }]`
- CSRF: `GET /csrf-token` + `x-csrf-token` on mutating requests; `credentials: 'include'`
- API base: `NUXT_PUBLIC_API_BASE_URL` (default `https://api.coolestprojects.localhost:8443`). On `https://voting.coolestprojects.localhost:8443` dev, the app calls the API same-origin (TLS proxy + Nitro server routes forward `/csrf-token`, `/auth`, `/languages`, `/projects` → port 3001). Port-forward `localhost:3005` resolves API to `localhost:3001`.
- Does not import `packages/database` directly

## Key flows

### Login

Jury account (`account_type: 'jury'`) posts credentials to `POST /auth/login`. JWT is stored in Pinia (`auth` store, persisted). Global middleware redirects unauthenticated users to `/login`.

Seeded dev login: `jury` / `jury` (see `apps/api` seeder). Six test projects are linked to event tables (`en`, `nl`, `fr`); select languages on `/language` before voting.

### Language filter

`GET /languages` lists `nl` / `fr` / `en`. Selection is persisted; changing languages clears the in-progress project so the next fetch uses the new filter.

### Vote loop

`GET /projects` returns the next random unrated project for the active event (fewest votes first). Skip sends `skipProject` with the current `project_id`. Submit posts category scores, then loads the next project. `{ message: 'finished' }` redirects to `/finished`.

Current project is persisted in Pinia so a browser refresh does not fetch a different project mid-review.

## Out of scope / unknowns

- PWA / offline install
- SSE (`GET /sse`) and admin voting events (`POST /`)
- Awards / vote calculation UI
- Production `CORS_ORIGINS` for `voting-dev` / `voting-prod` hostnames (Level27 infra; not in this repo's compose)

## Status

Status: deep
