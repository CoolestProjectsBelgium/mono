# Coolest Projects — AI Agent Guide

Monorepo for the reworked **Coolest Projects** platform: event registration, project management, voting, and admin tooling.

## Repository layout

```
mono/
├── apps/
│   ├── api/              # NestJS REST API (@coolestprojects/api)
│   ├── admin/            # AdminJS (@coolestprojects/admin)
│   ├── registration/     # Nuxt 3 registration SPA (@coolestprojects/registration)
│   ├── voting/           # placeholder
│   ├── eventguide/       # placeholder
│   └── presentation/     # placeholder
├── packages/
│   └── database/         # Shared Sequelize models (@coolestprojects/database)
├── .devcontainer/        # nginx proxy, certs, docker-compose, start.sh
└── package.json          # root npm workspaces
```

## Local development (devcontainer)

Open the repo in the dev container (`.devcontainer/docker-compose.yml`).

| Hostname | Port | App |
|----------|------|-----|
| `admin.coolestprojects.localhost:8443` | 3000 | AdminJS |
| `api.coolestprojects.localhost:8443` | 3001 | NestJS API |
| `registration.coolestprojects.localhost:8443` | 3004 | Nuxt registration SPA |
| `eventguide.coolestprojects.localhost:8443` | 3002 | stub |
| `presentation.coolestprojects.localhost:8443` | 3003 | stub |
| `voting.coolestprojects.localhost:8443` | 3005 | stub |

`postStartCommand` runs `.devcontainer/start.sh` which seeds the DB and starts all apps.

Supporting services: MySQL (`db`, `db_test`), Azurite, Mailhog (SMTP 1025, UI 8025), phpMyAdmin (3006), nginx TLS proxy (`proxy` on ports 8080/8443).

## Workspace commands

```bash
npm install
npm run build --workspace=@coolestprojects/database
npm run build --workspace=@coolestprojects/api
npm run start:dev --workspace=@coolestprojects/api
npm run dev --workspace=@coolestprojects/registration
npm test --workspace=@coolestprojects/registration
npm run test:e2e --workspace=@coolestprojects/api
```

## API conventions

- Business logic in `*.service.ts`; controllers stay thin
- Active event context from `InfoInterceptor` — use `@Info()` decorator
- JWT session via `jwt-cookiecombo` guard + `UserCookieInterceptor`
- Register new models in `packages/database`, export from `index.ts`, register in `apps/api/src/app.module.ts`

## Frontend conventions

- Nuxt 3 SPA (`ssr: false`), Pinia, i18n (nl/fr/en)
- API client: `apps/registration/composables/useApiClient.ts`
- Runtime API base: `NUXT_PUBLIC_API_BASE` → `/_api` (same-origin proxy via nginx on the registration host; direct API host: `https://api.coolestprojects.localhost:8443`)

## Testing

- Registration Vitest: `npm test --workspace=@coolestprojects/registration`
- API unit: `npm test --workspace=@coolestprojects/api`
- API e2e: `npm run test:e2e --workspace=@coolestprojects/api` (uses `db_test`)

## Environment variables (workspace container)

- `DB_*` / `DB_*_TEST` — MySQL
- `JWT_KEY`, `API_PORT`, `VOTING_KEY`
- `AZURE_STORAGE_CONNECTION_STRING` — Azurite in dev
- `SMTP_HOST=mailhog`, `SMTP_PORT=1025`
- `NUXT_PUBLIC_API_BASE`
