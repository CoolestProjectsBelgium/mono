# @coolestprojects/api

NestJS REST API for the Coolest Projects platform — participant registration, authentication, project management, file attachments, and voting endpoints.

## Quick start

From the monorepo root (inside the dev container):

```bash
npm run build -w @coolestprojects/database
npm run build -w @coolestprojects/api
npm run start:dev -w @coolestprojects/api
```

- Direct: https://api.coolestprojects.localhost:8443
- Swagger UI: https://api.coolestprojects.localhost:8443/api

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev -w @coolestprojects/api` | Watch mode |
| `npm run build -w @coolestprojects/api` | Compile TypeScript |
| `npm run seed-db -w @coolestprojects/api` | Seed development database (`event:init` CLI) |
| `npm test -w @coolestprojects/api` | Unit tests (Jest) |
| `npm run test:e2e -w @coolestprojects/api` | E2e tests (uses `db_test`) |

## Project structure

```
src/
├── auth/           # JWT and voting passport strategies
├── attachment/     # File upload and SAS token endpoints
├── login/          # Magic-link login, logout
├── registration/   # Event registration submission
├── userinfo/       # Participant profile CRUD
├── projectinfo/    # Project CRUD
├── participant/    # Co-participant invites
├── voting/         # Vote and category endpoints
├── event/          # Event service
├── mailer/         # Handlebars email rendering
├── azureblob/      # Azure Blob Storage integration
├── dto/            # Request/response DTOs with Swagger decorators
├── cli/            # nestjs-command CLI (database seeding)
└── app.module.ts   # Root module — register Sequelize models here
```

## Key patterns

- **Models**: imported from `@coolestprojects/database`; registered in `app.module.ts`.
- **Event context**: `InfoInterceptor` resolves the active event; inject with `@Info()` in controllers.
- **Auth**: `AuthGuard('jwt-cookiecombo')` + `UserCookieInterceptor` for cookie-based JWT sessions.
- **CORS**: allows `*.coolestprojects.localhost` and `localhost` origins with credentials.

## Environment variables

Set automatically in the dev container. See [README.md](../../README.md#environment-variables) for the full list.

| Variable | Default | Purpose |
|----------|---------|---------|
| `API_PORT` | `3001` | Listen port |
| `JWT_KEY` | — | JWT signing and cookie parser secret |
| `DB_*` | — | MySQL connection |
| `DB_*_TEST` | — | MySQL for e2e tests |
| `AZURE_STORAGE_CONNECTION_STRING` | — | Blob storage |
| `SMTP_HOST` / `SMTP_PORT` | `mailhog` / `1025` | Outbound email |

## Related docs

- [Registration API status](../registration/MISSING_APIS.md) — endpoints wired in the frontend
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — model and API conventions
- [packages/database](../../packages/database) — shared Sequelize models
