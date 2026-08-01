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

## Containers

Dev Container services (see [docs/local-setup.md](docs/local-setup.md)):

| Service | Role | URL / ports |
|---------|------|-------------|
| `workspace` | Node apps | ports 3000–3005 |
| `db` | MySQL | — |
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
