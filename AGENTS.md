# Agent guide — Coolest Projects monorepo

Start here. **`docs/` is the source of truth** for what the system is; this file is a thin map and workflow guide.

## Monorepo layout

npm workspaces monorepo (`package.json`):

| Path | Package | Role |
|------|---------|------|
| `apps/api` | `@coolestprojects/api` | NestJS HTTP API (shared backend) |
| `apps/admin` | `@coolestprojects/admin` | AdminJS admin panel |
| `apps/voting` | `@coolestprojects/voting` | Nuxt 3 voting UI |
| `apps/registration` | `@coolestprojects/registration` | Registration static site |
| `apps/eventguide` | `@coolestprojects/eventguide` | Event guide static site |
| `apps/cdj-web-int` | `@coolestprojects/cdj-web-int` | Archived CPBE project galleries (Level27 `cdj-web-int`) |
| `apps/presentation` | `@coolestprojects/presentation` | Presentation static site |
| `packages/database` | `@coolestprojects/database` | Shared Sequelize models |

## Documentation hub

- [docs/README.md](docs/README.md) — index of all doc pages
- [docs/architecture.md](docs/architecture.md) — monorepo map and key flows
- [docs/local-setup.md](docs/local-setup.md) — Dev Container setup (supported local path)
- Per-app pages: [docs/apps/](docs/apps/)
- Shared package: [docs/packages/database.md](docs/packages/database.md)
- Level27 publish: [docs/build-tools.md](docs/build-tools.md) (`build_tools/`)

## Before you change code

1. Read the matching `docs/apps/<name>.md` or `docs/packages/<name>.md` page.
2. If the page is `Status: stub` and you make a **material** change (new behavior, routes, models, config), expand that doc in the same change — fill in the sections you relied on and move toward `deep` if warranted.
3. Do not invent architecture; use **Out of scope / unknowns** sections as signals for gaps.
4. Do not duplicate long prose into `.cursor/rules/` — rules are short conventions only.
5. **Admin is a different stack.** `apps/admin` is AdminJS 7 + Express (`@adminjs/design-system`, resource options, page handlers). Do not apply Nest modules/DI/guards or `.agents/skills/nestjs-best-practices` there. Use `.agents/skills/adminjs/SKILL.md` instead.

## Cursor rules

| Rule | Scope |
|------|-------|
| `repo-docs.mdc` | Always — expand stub docs when touched |
| `api-nestjs.mdc` | `apps/api/**` (NestJS) |
| `database-sequelize.mdc` | `packages/database/**` |
| `admin-adminjs.mdc` | `apps/admin/**` (AdminJS + Express — not Nest, not Nuxt) |
| `voting-nuxt.mdc` | `apps/voting/**` (Nuxt 3) |

## Verify docs

```bash
npm run check-docs
```

Fails on missing files, required headings, broken relative links, or invalid rule frontmatter.

## Local development

Use the Dev Container (see [docs/local-setup.md](docs/local-setup.md)). `.devcontainer/start.sh` builds `database` and `api`, seeds the DB, and starts all apps on ports 3000–3005 behind the TLS proxy at `*.coolestprojects.localhost`.
