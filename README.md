# Coolest Projects

Monorepo for the reworked **Coolest Projects** platform — event registration, project management, voting, and admin tooling for [Coolest Projects Belgium](https://coolestprojects.be).

## Applications

| App | Package | Description |
|-----|---------|-------------|
| [API](apps/api) | `@coolestprojects/api` | NestJS REST API — registration, auth, attachments, voting |
| [Registration](apps/registration) | `@coolestprojects/registration` | Nuxt 3 SPA for participant registration (nl/fr/en) |
| [Admin](apps/admin) | `@coolestprojects/admin` | AdminJS back-office for event and content management |
| [Database](packages/database) | `@coolestprojects/database` | Shared Sequelize models used by API and Admin |
| Event guide | `@coolestprojects/eventguide` | Placeholder (static server) |
| Presentation | `@coolestprojects/presentation` | Placeholder (static server) |
| Voting | `@coolestprojects/voting` | Placeholder (static server) |

## Repository layout

```
mono/
├── apps/
│   ├── api/              # NestJS REST API
│   ├── admin/            # AdminJS
│   ├── registration/     # Nuxt 3 registration SPA
│   ├── voting/           # placeholder
│   ├── eventguide/       # placeholder
│   └── presentation/     # placeholder
├── packages/
│   └── database/         # Shared Sequelize models
├── .devcontainer/        # Docker Compose, nginx TLS proxy, certs
├── AGENTS.md             # Guide for AI coding assistants
└── CONTRIBUTING.md       # Development workflow and conventions
```

## Getting started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or compatible Docker engine)
- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.com/) with the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

### Dev container (recommended)

1. Clone this repository.
2. Open the folder in VS Code / Cursor and choose **Reopen in Container** when prompted (or run **Dev Containers: Reopen in Container** from the command palette).
3. On first start, `postCreateCommand` runs `npm install` and `postStartCommand` runs `.devcontainer/start.sh`, which:
   - Builds the database package and API
   - Seeds the development database
   - Starts all apps in the background

The dev container includes MySQL, Azurite (Azure Blob emulator), Mailhog, phpMyAdmin, and an nginx TLS reverse proxy.

### Trust the local CA (one-time)

Local HTTPS uses certificates generated with [easy-rsa](.devcontainer/certs/README.md). Import `.devcontainer/certs/pki/ca.crt` into your browser's trust store so `*.coolestprojects.localhost` loads without warnings.

## Local URLs

All apps are served over HTTPS on port **8443** via the nginx proxy.

| URL | Service |
|-----|---------|
| https://registration.coolestprojects.localhost:8443 | Registration SPA |
| https://api.coolestprojects.localhost:8443 | NestJS API |
| https://api.coolestprojects.localhost:8443/api | Swagger UI |
| https://admin.coolestprojects.localhost:8443/admin | AdminJS |
| https://eventguide.coolestprojects.localhost:8443 | Event guide (stub) |
| https://presentation.coolestprojects.localhost:8443 | Presentation (stub) |
| https://voting.coolestprojects.localhost:8443 | Voting (stub) |
| http://localhost:8025 | Mailhog (captured emails) |
| http://localhost:3006 | phpMyAdmin |

The registration app calls the API through a same-origin proxy at `/_api` (configured via `NUXT_PUBLIC_API_BASE`), so participants only need to trust the registration hostname.

## Common commands

Run these from the repository root inside the dev container:

```bash
# Install dependencies
npm install

# Build shared database package (required after model changes)
npm run build --workspace=@coolestprojects/database

# Start individual apps
npm run start:dev --workspace=@coolestprojects/api
npm run dev --workspace=@coolestprojects/registration
npm run start:dev --workspace=@coolestprojects/admin

# Run all tests
npm test

# API e2e tests (uses db_test)
npm run test:e2e
```

Use the `-w` shorthand as an alias for `--workspace`:

```bash
npm run build -w @coolestprojects/database
npm test -w @coolestprojects/api
```

## Architecture overview

```
┌─────────────────────┐     /_api proxy      ┌──────────────────┐
│  Registration SPA   │ ───────────────────► │   NestJS API     │
│  (Nuxt 3, Pinia)    │                      │   (Sequelize)    │
└─────────────────────┘                      └────────┬─────────┘
                                                      │
┌─────────────────────┐                               │
│      AdminJS        │ ◄── @coolestprojects/database
│  (Express + Admin)  │
└─────────────────────┘
         │
         ▼
    MySQL (db / db_test)          Azurite (blob storage)          Mailhog (SMTP)
```

- **Auth**: Magic-link login via email; JWT stored in an HTTP-only cookie (`jwt-cookiecombo` strategy).
- **Event context**: The active event is resolved per request by `InfoInterceptor`; controllers use the `@Info()` decorator.
- **File uploads**: Attachments are stored in Azure Blob Storage (Azurite locally); clients receive SAS tokens for direct upload.
- **Email**: `MailerService` renders Handlebars templates from `EmailTemplate` database records.

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding conventions and [AGENTS.md](AGENTS.md) for AI assistant guidance.

## Testing

| Scope | Command |
|-------|---------|
| Registration (Vitest) | `npm test -w @coolestprojects/registration` |
| API unit (Jest) | `npm test -w @coolestprojects/api` |
| API e2e (Jest + db_test) | `npm run test:e2e -w @coolestprojects/api` |
| All | `npm test` |

## Environment variables

The dev container sets these in `.devcontainer/docker-compose.yml`. Do not commit `.env` files.

| Variable | Purpose |
|----------|---------|
| `DB_*` | MySQL connection (development) |
| `DB_*_TEST` | MySQL connection (e2e tests) |
| `JWT_KEY` | JWT signing and cookie secret |
| `API_PORT` | API listen port (default 3001) |
| `VOTING_KEY` | Voting API authentication |
| `AZURE_STORAGE_CONNECTION_STRING` | Blob storage (Azurite in dev) |
| `SMTP_HOST` / `SMTP_PORT` | Outbound email (Mailhog in dev) |
| `NUXT_PUBLIC_API_BASE` | Registration API base path (`/_api`) |
| `ADMINJS_COOKIE_SECRET` / `ADMINJS_PORT` | AdminJS session and port |

## License

[MIT](LICENSE) — Copyright (c) 2025 Coolest Projects Belgium
