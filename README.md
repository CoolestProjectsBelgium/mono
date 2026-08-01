# Coolest Projects monorepo

Monorepo for the reworked Coolest Projects applications and shared packages.

## Quick links

- **Documentation hub:** [docs/README.md](docs/README.md)
- **Architecture:** [docs/architecture.md](docs/architecture.md)
- **Local setup:** [docs/local-setup.md](docs/local-setup.md)
- **Agent guide:** [AGENTS.md](AGENTS.md)

## Workspaces

| Path | Description |
|------|-------------|
| `apps/api` | NestJS API |
| `apps/admin` | AdminJS admin panel |
| `apps/voting` | Nuxt voting UI |
| `apps/registration` | Registration site |
| `apps/eventguide` | Event guide site |
| `apps/presentation` | Presentation site |
| `packages/database` | Shared Sequelize models |

Install dependencies from the repo root:

```bash
npm install
```

Verify documentation index:

```bash
npm run check-docs
```
