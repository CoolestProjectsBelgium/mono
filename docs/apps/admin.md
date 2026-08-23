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

Local URL (via proxy): `https://admin.coolestprojects.localhost:8443` (redirects to `/admin`)

Default seed logins (from API seeder): `superadmin` / `admin` / `jury` — passwords are set in `apps/api/src/seeder/seed.ts`.

## Talks to

- `packages/database` — Sequelize models (direct DB access)
- MySQL — same database as API
- Does not call `apps/api` over HTTP

Sequelize models registered in `apps/admin/src/database.ts` must include every association target (including through-models like `UserProject`). Omitting one crashes AdminJS boot with `X has not been defined`.

## Key resources

| Resource | Notes |
|----------|-------|
| `Project` | Explicit list/show/filter/edit properties include `deletedAt` soft-delete timestamp |
| `UserProject` | Membership/voucher link; has its own `deletedAt` |
| `Account` | Password via `@adminjs/passwords`; `encryptedPassword` hidden |
| `Event` | Event-scoped access for non-superadmin roles |

The dashboard handler in [`apps/admin/src/components/dashboard/handler.ts`](../../apps/admin/src/components/dashboard/handler.ts)
exports `DashboardResponse` and `DashboardTableItem` for reuse by TSX components. It returns the same complete
response shape when no event is selected, and uses the registered database models directly for Sequelize counts.

## Out of scope / unknowns

- Full custom AdminJS action catalog beyond the above
- Production session/cookie configuration
- How judge voting dashboard integrates with live voting app

## Status

Status: stub
