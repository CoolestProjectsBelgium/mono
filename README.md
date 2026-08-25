# Coolest Projects monorepo

Monorepo for the reworked Coolest Projects applications and shared packages.

## Quick links

- **Documentation hub:** [docs/README.md](docs/README.md)
- **Architecture:** [docs/architecture.md](docs/architecture.md)
- **Local setup:** [docs/local-setup.md](docs/local-setup.md)
- **Agent guide:** [AGENTS.md](AGENTS.md)

## Workspaces

| Path | Description | Local URL |
|------|-------------|-----------|
| `apps/api` | NestJS API | https://api.coolestprojects.localhost:8443 |
| `apps/admin` | AdminJS admin panel | https://admin.coolestprojects.localhost:8443 |
| `apps/voting` | Nuxt voting UI | https://voting.coolestprojects.localhost:8443 |
| `apps/registration` | Registration site | https://registration.coolestprojects.localhost:8443 |
| `apps/eventguide` | Event guide site | https://eventguide.coolestprojects.localhost:8443 |
| `apps/presentation` | Presentation site | https://presentation.coolestprojects.localhost:8443 |
| `packages/database` | Shared Sequelize models | — |

## Admin login (local seed)

After the Dev Container seeds the DB, use these accounts at https://admin.coolestprojects.localhost:8443:

| Email | Password | Role |
|-------|----------|------|
| `superadmin` | `superadmin` | super_admin |
| `admin` | `admin` | admin |
| `jury` | `jury` | jury |

## Local mail (MailHog)

The Dev Container runs [MailHog](https://github.com/mailhog/MailHog) as the SMTP catcher. The API sends mail to `mailhog:1025`; open the UI to read captured messages (activation / magic-link emails, etc.):

| What | URL / port |
|------|------------|
| MailHog UI | http://localhost:18025 |
| SMTP (host) | `localhost:11025` |

Host ports `18025` / `11025` avoid Windows Hyper-V reserved ranges (`8025` / `1025`). See [docs/local-setup.md](docs/local-setup.md).

## Containers

Dev Container services (see [docs/local-setup.md](docs/local-setup.md)):

| Service | Role | URL / ports |
|---------|------|-------------|
| `workspace` | Node apps | ports 3000–3005 |
| `db` | MySQL | — |
| `mailhog` | SMTP catcher + UI | http://localhost:18025 |
| `phpmyadmin` | DB UI | http://localhost:3006 |
| `proxy` | TLS reverse proxy | HTTP 8080 / HTTPS 8443 |

Install dependencies from the repo root:

```bash
npm install
```

Verify documentation index:

```bash
npm run check-docs
```

Publish to Level27 (manual CLI): see [docs/build-tools.md](docs/build-tools.md).
