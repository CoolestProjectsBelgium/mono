# @coolestprojects/admin

AdminJS back-office for managing Coolest Projects events, registrations, content, and admin users.

## Quick start

From the monorepo root (inside the dev container):

```bash
npm run build -w @coolestprojects/database
npm run start:dev -w @coolestprojects/admin
```

Open https://admin.coolestprojects.localhost:8443/admin (root `/` redirects here)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev -w @coolestprojects/admin` | Watch mode (tsx) |
| `npm run build -w @coolestprojects/admin` | Compile TypeScript |

## Roles

| Role | Access |
|------|--------|
| `superadmin` | Full access to all resources |
| `admin` | Resources scoped to the selected event; can change own password |
| `judge` | Voting dashboard and own votes |

Custom AdminJS components live in `src/components/` (e.g. `Login`, `Dashboard`).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `ADMINJS_PORT` | Listen port (default 3000) |
| `ADMINJS_COOKIE_SECRET` | Express session secret |
| `DB_*` | MySQL connection (same as API) |

## Related docs

- [packages/database](../../packages/database) — shared Sequelize models
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — development conventions
