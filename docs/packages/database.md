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
| `User` | `BaseEventModel` | Participant user |
| `Registration` | `BaseEventModel` | Registration record |
| `Project` | `BaseEventModel` | Submitted project |
| `UserProject` | `BaseEventModel` | User↔project link, voucher, owner flag |
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

Exports are listed in `packages/database/src/index.ts`.

## Key flows

### Event scoping

`BaseEventModel.eventId` scopes most records to an `Event`. AdminJS filters resources by `currentAdmin.eventId`.

### Registration data

`User` + `Registration` + `QuestionRegistration` / `QuestionUser` + optional `Tshirt` selections.

### Project + voting

`Project` ← `UserProject` (voucher GUID, `isOwner`) → `Vote` in `VoteCategory`.

### Admin access

`Account` model used by AdminJS with role-based resource access in `apps/admin`.

### TypeScript class fields

`packages/database/tsconfig.json` sets `useDefineForClassFields: false` (ES2022 would otherwise default to `true`). Emitting real instance fields shadows sequelize-typescript getters — association access like `question.translations[0]` then returns `undefined` and catalog endpoints 500. Prefer `declare` on model properties when adding fields.

## Out of scope / unknowns

- Migration files (API uses `synchronize: true` in dev — verify production strategy)
- Model validation rules beyond Sequelize column definitions
- Indexes and performance tuning

## Status

Status: deep
