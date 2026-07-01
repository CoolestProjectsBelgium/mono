# Contributing

This guide covers local development workflow and conventions for the Coolest Projects monorepo.

## Development setup

1. Use the [dev container](README.md#getting-started) — it provides MySQL, Azurite, Mailhog, nginx TLS, and all required environment variables.
2. After cloning, dependencies install automatically via `postCreateCommand`.
3. Apps start automatically via `postStartCommand` (`.devcontainer/start.sh`). To restart manually:

```bash
npm run build -w @coolestprojects/database
npm run build -w @coolestprojects/api
npm run seed-db -w @coolestprojects/api   # re-seed development data
```

## Workspace structure

This is an npm workspaces monorepo. Each app and package has its own `package.json` with a scoped name (`@coolestprojects/*`).

Always run scripts with the workspace flag from the repo root:

```bash
npm run <script> --workspace=@coolestprojects/<package>
# or
npm run <script> -w @coolestprojects/<package>
```

## Adding or changing database models

Models live in `packages/database/src/models/`.

1. Create or edit the model in `packages/database/src/models/`.
2. Export it from `packages/database/src/index.ts`.
3. Rebuild the package:

```bash
npm run build -w @coolestprojects/database
```

4. Register the model in `apps/api/src/app.module.ts` (both `SequelizeModule.forRootAsync({ models: [...] })` and `forFeature([...])`).
5. If AdminJS should manage the resource, register it in `apps/admin/src/index.ts`.

Use `.js` extensions in database package exports (NodeNext ESM):

```typescript
export * from './models/user.model.js';
```

## API conventions (NestJS)

- **Business logic** belongs in `*.service.ts`. Keep controllers thin.
- **DTOs** live in `apps/api/src/dto/` with Swagger decorators.
- **Active event context** comes from `InfoInterceptor` — use the `@Info()` decorator in controllers.
- **Auth**: protect routes with `AuthGuard('jwt-cookiecombo')` and `UserCookieInterceptor`.
- **File uploads**: `AttachmentService` + `AzureBlobService`; SAS tokens for client-side upload.
- **Email**: `MailerService` renders `EmailTemplate` records with Handlebars.

Swagger is available at https://api.coolestprojects.localhost:8443/api when the API is running.

## Frontend conventions (Registration)

- Nuxt 3 SPA (`ssr: false`), Pinia for state, i18n (nl/fr/en), Tailwind CSS.
- API client: `apps/registration/composables/useApiClient.ts`.
- Runtime API base: `NUXT_PUBLIC_API_BASE` → `/_api` (same-origin proxy via nginx).
- API integration status: see [apps/registration/MISSING_APIS.md](apps/registration/MISSING_APIS.md).

## Admin conventions

- AdminJS with Sequelize adapter; shares models from `@coolestprojects/database`.
- Roles: `superadmin`, `admin` (scoped to selected event), `judge` (voting dashboard).
- Custom components live in `apps/admin/src/components/`.

## Testing

Run tests before opening a pull request:

```bash
npm test                                          # all unit tests
npm run test:e2e -w @coolestprojects/api          # API e2e (uses db_test)
npm test -w @coolestprojects/registration         # registration Vitest
```

- API unit tests: `*.spec.ts` next to source files.
- API e2e tests: `apps/api/test/` — uses `DB_*_TEST` environment variables.
- Registration tests: Vitest with `@nuxt/test-utils`.

## What not to commit

- `.env` files and secrets
- `dist/` build output
- `node_modules/`
- Local certificate private keys (the repo includes dev certs; do not add production keys)

## Useful local tools

| Tool | URL / access |
|------|--------------|
| Mailhog | http://localhost:18025 — view magic-link and notification emails |
| phpMyAdmin | http://localhost:3006 — inspect MySQL (host: `db`, user: `coolestproject`) |
| Azurite | Blob endpoint on port 10000 — attachment storage in dev |

## Further reading

- [README.md](README.md) — overview and quick start
- [AGENTS.md](AGENTS.md) — conventions for AI coding assistants
- [.devcontainer/certs/README.md](.devcontainer/certs/README.md) — regenerating TLS certificates
