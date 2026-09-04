# Local setup

Supported local development path: **VS Code / Cursor Dev Container**.

## Prerequisites

- Docker Desktop (or compatible Docker engine)
- Dev Containers extension (VS Code / Cursor)

## Start

1. Open the repo and **Reopen in Container** (uses [`.devcontainer/devcontainer.json`](../.devcontainer/devcontainer.json)).
2. `postCreateCommand` runs `npm install`.
3. `postStartCommand` runs [`.devcontainer/start.sh`](../.devcontainer/start.sh), which:
   - Installs Nest CLI globally
   - Builds `packages/database` and `apps/api`
   - Seeds the database (`npm run seed-db --workspace=apps/api`)
   - Starts all apps in the background

## Services

| Service | Role |
|---------|------|
| `workspace` | Node dev container, ports 3000–3005 |
| `db` | MySQL (`coolestproject` database) |
| `mailhog` | SMTP catcher; UI at http://localhost:18025 |
| `phpmyadmin` | http://localhost:3006 |
| `proxy` | TLS reverse proxy, ports 8080 (HTTP) / 8443 (HTTPS) |

Compose definition: [`.devcontainer/docker-compose.yml`](../.devcontainer/docker-compose.yml).

## App URLs (via proxy)

HTTPS (recommended — matches cert setup):

| App | URL |
|-----|-----|
| Admin | https://admin.coolestprojects.localhost:8443 |
| API | https://api.coolestprojects.localhost:8443 |
| Event guide | https://eventguide.coolestprojects.localhost:8443 |
| Presentation | https://presentation.coolestprojects.localhost:8443 |
| Registration | https://registration.coolestprojects.localhost:8443 |
| Voting | https://voting.coolestprojects.localhost:8443 |
| MailHog | http://localhost:18025 (captured emails; host port 18025 on Windows) |

Proxy vhost config: [`.devcontainer/dockerfile_proxy/proxy_templates/proxy.conf`](../.devcontainer/dockerfile_proxy/proxy_templates/proxy.conf).

Nuxt SPA apps (registration, voting, eventguide) need `AllowEncodedSlashes NoDecode` and `ProxyPass ... nocanon` so Vite virtual-module URLs containing `%2F` are not rejected as 404 (blank page otherwise). After changing proxy templates, rebuild/restart the `proxy` container.

Direct ports (inside/on workspace container):

| Port | App |
|------|-----|
| 3000 | Admin |
| 3001 | API |
| 3002 | Event guide |
| 3003 | Presentation |
| 3004 | Registration |
| 3005 | Voting |

## Environment

DB and app secrets are set in `docker-compose.yml` on the `workspace` service (`DB_*`, `JWT_KEY`, `ADMINJS_*`, `VOTING_KEY`, `FILE_*`, etc.). Do not commit production secrets; treat compose values as local-dev only.

Mail: the Dev Container sets `SMTP_HOST=mailhog`, `SMTP_PORT=1025`, and `SMTP_FROM`. Captured mail appears in MailHog at http://localhost:18025 (SMTP on host port `11025`). If `SMTP_HOST` is unset, the API logs the message (including activation URL) and skips sending so registration still succeeds.

Voting app API base URL: `NUXT_PUBLIC_API_BASE_URL` (defaults to `https://api.coolestprojects.localhost:8443` in `nuxt.config.ts`). On `https://voting.coolestprojects.localhost:8443`, the app calls the API same-origin: the TLS proxy forwards `/csrf-token`, `/auth`, `/languages`, `/projects` to port 3001 (rebuild the `proxy` container after changing `proxy.conf`). Port-forward users on `http://localhost:3005` hit Nitro server routes that proxy the same paths. Trust the dev CA (`.devcontainer/certs/pki/ca.crt`) if you call `api.coolestprojects.localhost` directly from the browser.

Registration app API base URL: `API_BASE_URL` (defaults to `https://api.coolestprojects.localhost:8443` in `nuxt.config.ts`). The API must list the registration origin in `CORS_ORIGINS` (set in compose for local dev).

## Certificates

TLS certs live under [`.devcontainer/certs/`](../.devcontainer/certs/). If `*.coolestprojects.localhost` does not resolve, add hosts entries or trust the local CA per [`.devcontainer/certs/README.md`](../.devcontainer/certs/README.md).

Registration calls the API on **`api.coolestprojects.localhost`** (separate origin). Trusting only the registration site in the browser is not enough — install the dev CA once on your **host OS** so all `*.coolestprojects.localhost` HTTPS calls succeed (avoids `ERR_CERT_AUTHORITY_INVALID` on `/settings`, attachments, etc.).

**Windows (PowerShell, user store):**

```powershell
certutil -addstore -user Root .devcontainer\certs\pki\ca.crt
```

Restart the browser after installing the CA.

## Manual commands

```bash
# Rebuild database package
npm run build --workspace=packages/database

# Start API only
npm run start:dev --workspace=apps/api

# Verify docs index
npm run check-docs
```

## Unknowns

- Native (non-container) setup is unsupported in this doc
- Production parity for file upload URLs (`FILE_BASE_URL`)
- Whether `synchronize: true` is acceptable beyond local dev
