---
name: adminjs
description: >-
  AdminJS 7 + Express conventions for apps/admin. Use when writing, reviewing,
  or refactoring AdminJS resources, pages, ComponentLoader components, handlers,
  auth, or design-system UI. Do not use NestJS, Nuxt, Vue, or Tailwind patterns.
---

# AdminJS (apps/admin)

`apps/admin` is **AdminJS 7 on Express** with `@adminjs/sequelize`. It is a different stack from `apps/api` (Nest) and `apps/voting` (Nuxt).

Do **not** apply `.agents/skills/nestjs-best-practices` here.

Read [docs/apps/admin.md](../../../docs/apps/admin.md) and copy existing files under `apps/admin/src/` before inventing APIs.

## Do not

- Nest modules / controllers / services / guards / pipes / interceptors / DTOs
- New `@nestjs/*` imports (`database.ts` already uses `ConfigService` for env — that is the only Nest leftover)
- `@adminjs/nestjs`
- Vue SFCs, Tailwind, Nuxt UI, Pinia, MUI, generic `styled-components`
- HTTP calls to `apps/api` for CRUD (AdminJS talks to MySQL via Sequelize)
- Vite / Webpack / Nuxt for custom components (AdminJS Rollup via `ComponentLoader`)
- Runtime imports of server modules from `.tsx` files

## Prefer this order

1. **Resource config** in `src/index.ts` — `properties`, `listProperties`, `actions` (`before`, `isAccessible`), `features` (`@adminjs/passwords`, `@adminjs/import-export`).
2. **Event scoping** via `src/authorisations.ts` (`filterEventId`, `canAccessResourceFieldFilter`, `andAccess`).
3. **Custom page** only when CRUD is not enough: `pages` on the `AdminJS` constructor + `componentLoader.add` + colocated `handler.ts` + `*.tsx`.

## Custom page shape

```
src/components/<name>/
  handler.ts    # server: sequelize, context.currentAdmin
  <Name>.tsx    # client: design-system + ApiClient
```

Register in `loader.ts` and `components/index.ts`. Dashboard uses `api.getDashboard()`; pages use `api.getPage({ pageName })`. Mutations use `api.recordAction({ resourceId, actionName, recordId, data })`.

Client UI primitives: `Box`, `Button`, `Table`, `Text`, `H2`, … from `@adminjs/design-system`. Charts: `recharts/es6/...` deep imports, never `from 'recharts'`.

## Auth and session

`AdminJSExpress.buildAuthenticatedRouter` + `express-session` (Sequelize store). Login override in `ComponentLoader`; extra Express routes only for login helpers (`components/login/router.ts`). Roles live on `currentAdmin` (`superadmin` / `admin` / `judge`).
