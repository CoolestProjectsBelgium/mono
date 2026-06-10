# Coolest Projects — AI Agent Guide

Monorepo for the reworked **Coolest Projects** platform: event registration, project management, voting, and admin tooling.

## Repository layout

```
mono/
├── backend/                  # npm workspaces root
│   ├── apps/
│   │   ├── api/              # NestJS REST API (@coolestprojects/api)
│   │   └── admin/            # AdminJS standalone Express app (@coolestprojects/admin)
│   └── packages/
│       └── database/         # Shared Sequelize models (@coolestprojects/database)
├── frontend/                 # Nuxt 3 registration SPA
├── configuration/            # Traefik TLS certs and proxy config
├── docker-compose.yml        # Local dev stack (proxy, MySQL, Azurite, backend, frontend)
├── .devcontainer/            # VS Code / Cursor dev container (extends docker-compose)
└── .env                      # Required at repo root (not committed)
```

**Not yet in this repo:** `voting/` (Nuxt).

## Tech stack

| Layer | Technology |
|-------|------------|
| API | NestJS 10, Express, Swagger at `/api` |
| ORM | Sequelize + sequelize-typescript |
| Database | MySQL (dev + test instances via Docker) |
| Auth | JWT via passport-jwt; cookie-parser with `JWT_KEY`; SAML stubbed |
| Storage | Azure Blob (Azurite emulator locally) |
| Email | Nodemailer + Handlebars templates from `EmailTemplate` model |
| Admin | AdminJS + Express (separate app in `apps/admin`) |
| Frontend | Nuxt 3 SPA (`ssr: false`), Tailwind, Pinia, i18n (nl/fr/en) |
| Proxy | Traefik with local TLS (`*.coolestprojects.localhost`) |

## Development

### Docker (recommended)

```bash
docker compose up
```

- API: `https://backend.coolestprojects.localhost:1234` (mapped to container port 3000)
- Frontend: `https://app.coolestprojects.localhost:1234`
- Traefik dashboard: `http://localhost:9080`
- phpMyAdmin: `http://localhost:8081`
- Azurite blob: `http://localhost:10000`

The `backend` service runs `npm run start:debug` inside the container. Source is bind-mounted from `./backend`; `node_modules` uses a named volume (required for native modules like bcrypt on Windows).

### Dev container

Open in Cursor/VS Code with the dev container — attaches to the `backend` service, workspace at `/home/node/app`.

### Local commands (from `frontend/`)

```bash
npm install
npm run dev          # SPA dev server
npm test             # Vitest
npm run build        # production build
```

Set `NUXT_PUBLIC_API_BASE` to the backend URL (defaults to `https://backend.coolestprojects.localhost:1234`). See `frontend/MISSING_APIS.md` for endpoints that return `null` until backend wiring is complete.

### Local commands (from `backend/`)

```bash
npm install
npm run start:dev          # API watch mode
npm run build              # Build API (prebuilds database package)
npm run test:e2e -w @coolestprojects/api
npm run start:admin-dev -w @coolestprojects/api   # AdminJS dev server
```

### Database package

Models live in `backend/packages/database/src/models/`. Build before API changes that depend on model exports:

```bash
npm run build --workspace=@coolestprojects/database
```

The API resolves `@coolestprojects/database` via TypeScript path alias in dev and as a workspace dependency in production builds.

### CLI

```bash
npm run build -w @coolestprojects/api
node backend/apps/api/dist/cli.js event:create
node backend/apps/api/dist/cli.js event:init
```

(`CliModule` is currently commented out in `app.module.ts`; CLI may need re-enabling.)

## Architecture

### API module map (`backend/apps/api/src/`)

| Path | Responsibility |
|------|----------------|
| `app.controller.ts` | Public config: tshirts, questions, approvals, settings |
| `registration/` | User registration flow |
| `login/` | Login, logout, mail token |
| `userinfo/` | Authenticated user CRUD |
| `projectinfo/` | Project CRUD for authenticated users |
| `participant/` | Add/remove participants on a project |
| `attachment/` | File uploads via Azure Blob + SAS tokens |
| `auth/` | JWT strategy, Passport module |
| `mailer/` | Email sending |
| `azureblob/` | Azure storage integration |
| `tokens/` | Token generation/validation |
| `background/` | Scheduled tasks (`@nestjs/schedule`) |
| `event/` | Event lifecycle helpers |
| `dto/` | Request/response DTOs (Swagger-decorated) |
| `seeder/` | Database seeding |

### Cross-cutting concerns

- **`InfoInterceptor`** — global interceptor; resolves the active event and attaches `InfoDto` to every request context.
- **`@Info()` decorator** — injects event context into controller handlers.
- **Sequelize `synchronize: true`** — schema auto-sync in dev; no migrations directory yet.
- **Tests** — unit specs (`*.spec.ts`) colocated in `src/`; e2e in `test/` with separate test DB env vars (`DB_*_TEST`).

### Database models (`@coolestprojects/database`)

Core domain: `Event`, `User`, `Registration`, `Project`, `Location`, `Question` (+ translations), `Tshirt` (+ groups/translations), `Attachment`, `AzureBlob`, `Voucher`, `Vote`, `VoteCategory`, `Certificate`, `Award`, `Account`, `EmailTemplate`, `Message`, `Hyperlink`, `EventTable`, `ProjectTable`.

Models use sequelize-typescript decorators (`@Table`, `@Column`). Export new models from `packages/database/src/index.ts` and register them in `app.module.ts` Sequelize config.

## API routes (prefix)

| Controller | Base path |
|------------|-----------|
| App | `/` (tshirts, questions, approvals, settings) |
| Registration | `/registration` |
| Login | `/login` |
| Userinfo | `/userinfo` |
| Projectinfo | `/projectinfo` |
| Attachments | `/attachments` |
| Participant | `/participant` |

Swagger UI: `/api`

## Environment variables

Set in root `.env` (loaded by docker-compose `env_file`) and/or container environment:

- `JWT_KEY` — cookie signing + JWT secret
- `DB_DIALECT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `DB_HOST_TEST`, `DB_USER_TEST`, `DB_PASS_TEST`, `DB_NAME_TEST` — e2e tests
- `AZURE_STORAGE_CONNECTION_STRING` — Azurite in dev

## Conventions

- **TypeScript**: `strict: true`, `module: NodeNext`, ESM imports with `.js` extensions in database package exports.
- **Monorepo**: npm workspaces; run workspace scripts with `-w @coolestprojects/<pkg>`.
- **DTOs**: one file per domain object in `dto/`; use class-validator/Swagger decorators.
- **Services**: business logic in `*.service.ts`; controllers stay thin.
- **Do not edit** `dist/`, generated `*.d.ts` in `packages/database/src/models/`, or `node_modules/`.
- **Do not commit** `.env`, certs private keys, or build artifacts.

## What to read first

1. `backend/apps/api/src/app.module.ts` — wiring, models, providers
2. `backend/apps/api/src/main.ts` — bootstrap, Swagger, cookies
3. `backend/apps/api/src/info.interceptor.ts` — event context pattern
4. `backend/packages/database/src/index.ts` — model exports
5. `docker-compose.yml` — local infrastructure
