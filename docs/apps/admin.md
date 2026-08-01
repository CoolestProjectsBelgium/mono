# Admin app

## Purpose

AdminJS-based admin panel for Coolest Projects staff. Manages events, registrations, accounts, and voting resources with role-based access (`superadmin`, `admin`, `judge`).

## Stack

- AdminJS 7, Express, `@adminjs/sequelize`
- TypeScript (ESM), `tsx` for dev
- `@coolestprojects/database` for models and Sequelize connection

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/admin/src/index.ts` | AdminJS app bootstrap, resources, auth |
| `apps/admin/src/database.ts` | Sequelize connection |
| `apps/admin/src/components/` | Custom AdminJS components (`Login`, `Dashboard`) |
| `npm run start:dev --workspace=apps/admin` | Dev server (port 3000 in Dev Container) |

Local URL (via proxy): `https://admin.coolestprojects.localhost:8443`

## Talks to

- `packages/database` — Sequelize models (direct DB access)
- MySQL — same database as API
- Does not call `apps/api` over HTTP

## Out of scope / unknowns

- Full resource list and custom AdminJS actions (expand when editing admin features)
- Production session/cookie configuration
- How judge voting dashboard integrates with live voting app

## Status

Status: stub
