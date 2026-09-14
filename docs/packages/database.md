# Database package

## Purpose

Shared Sequelize-TypeScript models for Coolest Projects. Consumed by `apps/api` (NestJS) and `apps/admin` (AdminJS). Single source of truth for the MySQL schema shape.

## Stack

- `sequelize-typescript`, `bcrypt` (password hashing)
- TypeScript, compiled to `dist/`
- Peer usage: `@nestjs/sequelize`, `@adminjs/sequelize`

## Entrypoints

| Path / command | Role |
|----------------|------|
| `packages/database/src/models/` | Model definitions |
| `packages/database/src/migrations/` | Umzug migrations — required alongside any model change, see below |
| `packages/database/src/index.ts` | Public barrel exports |
| `npm run build --workspace=packages/database` | Compile (required before API/admin dev) |

Build output: `packages/database/dist/`.

## Talks to

- MySQL (via consumer apps' Sequelize connections)
- Not imported by frontends (`voting`, static sites)

## Model map

Most domain models extend `BaseEventModel` (adds `eventId` FK to `Event`). `Event` and `Account` are top-level.

| Model | Extends | Role |
|-------|---------|------|
| `Event` | `Model` | Event config, dates, limits, floorplan |
| `Account` | — | Admin/staff accounts (AdminJS auth) |
| `User` | `BaseEventModel` | Participant user (`postalcode`, `municipality_name`, `tshirtId`, `via` / `via_type` affiliation, profile fields) |
| `Registration` | `BaseEventModel` | Registration record (`via` / `via_type` copied to User on activate) |
| `Project` | `BaseEventModel` | Submitted project (`deletedAt` soft-delete) |
| `UserProject` | `BaseEventModel` | User↔project link, voucher, owner flag (`deletedAt` soft-delete) |
| `Question` | `BaseEventModel` | Registration question |
| `QuestionTranslation` | — | Question i18n |
| `QuestionRegistration` | — | Question answers on registration |
| `QuestionUser` | — | Question answers per user |
| `Tshirt` | `BaseEventModel` | T-shirt option |
| `TshirtGroup` | `BaseEventModel` | T-shirt grouping |
| `TshirtTranslation` | — | T-shirt i18n |
| `TshirtGroupTranslation` | — | Group i18n |
| `Vote` | `BaseEventModel` | Cast vote |
| `VoteCategory` | `BaseEventModel` | Voting category |
| `Attachment` | `BaseEventModel` | Project file attachment |
| `Certificate` | `BaseEventModel` | Certificate record |
| `Award` | `BaseEventModel` | Award |
| `Message` | `BaseEventModel` | Messages |
| `EmailTemplate` | `BaseEventModel` | Email templates |
| `EventTable` | `BaseEventModel` | Event table/seating |
| `Affiliation` | `BaseEventModel` | CoderDojo catalog (`name` without the `Dojo` prefix); served as `GET /dojos` |

Exports are listed in `packages/database/src/index.ts`.

## Key flows

### Event scoping

`BaseEventModel.eventId` scopes most records to an `Event`. AdminJS filters resources by `currentAdmin.eventId`.

### Registration data

`User` + `Registration` + `QuestionRegistration` / `QuestionUser` + optional `Tshirt` selections. Optional affiliation is `via_type` (`dojo` \| `other` \| null) plus `via` (dojo name without the `Dojo` prefix, or free-text organisation). Null `via_type` is the not-applicable choice. Known dojo names live in `Affiliation` for the event; registration and profile updates reject unknown dojo names.

### Project + voting

`Project` ← `UserProject` (voucher GUID, `isOwner`) → `Vote` in `VoteCategory`. Soft-deleted projects (`Project.deletedAt`) and memberships (`UserProject.deletedAt`) are excluded from active registration, join, and voting paths.

### Admin access

`Account` model used by AdminJS with role-based resource access in `apps/admin`.

### Schema changes (models + migrations + views)

| Change | Developer edits | Applied on |
|--------|-----------------|------------|
| Table/column (Dev Container) | `packages/database/src/models/*.ts` | API boot when `DB_SYNCHRONIZE=true` (Dev Container) or `DB_SYNC_ALTER=true` (Level27 test estate only) |
| Table/column (test estate + prod) | `packages/database/src/models/*.ts` **and** a matching migration in `packages/database/src/migrations/*.ts` | `node dist/cli db:migrate` during **api** deploy (before restart) — see [build-tools.md](../build-tools.md) |
| SQL view | `apps/admin/src/components/admin/SQL-data/*` + AdminJS column defs in `apps/admin/src/index.ts` | `node apply-views.cjs` during **api** deploy (before restart) |

**Every schema change ships as both a model edit and a migration file** in `packages/database/src/migrations/*.ts` (`up`/`down` against `QueryInterface`, resolved via Umzug's glob loader — see `apps/api/src/cli/migrate.command.ts`, naming convention `<timestamp>-<description>.ts` per the existing `20260101000000-baseline.ts`). This applies whether the change is:

- **A brand-new model** (e.g. a new file under `src/models/`, new table) → migration calls `queryInterface.createTable(...)` for it.
- **A new/changed column on an existing model** → migration calls `queryInterface.addColumn(...)` / `changeColumn(...)` / `removeColumn(...)`.

The model edit alone is not enough to reach prod once `DB_SYNC_ALTER` is off there — a PR (including one produced by an agent) that adds or edits a model under `packages/database/src/models/` without a matching migration is incomplete.

Level27 uses `NODE_ENV=production`; schema flags are explicit (`DB_SYNC_ALTER`, `DB_SYNCHRONIZE`), not tied to `NODE_ENV`. **api-prod** no longer runs with `DB_SYNC_ALTER` — migrations are the only way schema reaches it. **api-dev** (Level27 test estate) still keeps `DB_SYNC_ALTER=true` running alongside migrations as an extra safety net.

Deploy does not overwrite remote `.env`. See [build-tools.md](../build-tools.md).

### TypeScript class fields

`packages/database/tsconfig.json` sets `useDefineForClassFields: false` (ES2022 would otherwise default to `true`). Emitting real instance fields shadows sequelize-typescript getters — association access like `question.translations[0]` then returns `undefined` and catalog endpoints 500. Prefer `declare` on model properties when adding fields.

## Out of scope / unknowns

- Model validation rules beyond Sequelize column definitions
- Indexes and performance tuning

## Status

Status: deep
