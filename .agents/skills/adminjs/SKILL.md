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
- `@nestjs/*` imports (`database.ts` reads `DB_*` from `process.env`)
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

## Calling apps/api (Nest) from a handler

Some staff actions (voting control, floorplan processing) are business logic that lives in `apps/api`, not something to reimplement against Sequelize models directly. From a `handler.ts`, call it through `NestApiClient` in [`apps/admin/src/api/nest-api-client.ts`](../../../apps/admin/src/api/nest-api-client.ts):

```ts
import { NestApiClient } from '../../api/nest-api-client.js';

export const Handler = async (request: any, _response: any, context: any) => {
  const eventId = context.currentAdmin?.eventId;
  if (!eventId) throw new Error('No event selected');

  const api = await NestApiClient.fromExpressRequest(request);
  return (await api.get<SomeShape>('/admin/some-endpoint')).data;
  // mutations: await api.post('/admin/some-endpoint', body) — auto-attaches CSRF
};
```

Copy `components/voting/handler.ts` or `components/floorplans/handler.ts` rather than re-deriving this.

**Don't confuse this with the `ApiClient` imported from `'adminjs'` in `.tsx` files** — that one talks to AdminJS's own Express router (`getDashboard`, `getPage`, `recordAction`, browser → admin server) and is unrelated. `NestApiClient` is server-side only, admin → `apps/api`, and only belongs in `handler.ts` — the distinct name is deliberate, keep it that way rather than renaming back to `ApiClient`.

How it authenticates: it forwards the incoming request's `adminjs` session cookie as-is. `apps/api`'s `mandatory-admin-cookie` guard (`admin-cookie.strategy.ts`) reads that same cookie, unsigns it with `ADMINJS_COOKIE_SECRET` (must be the identical env var/value on both apps — it's also what `apps/admin` signs the cookie with), and looks the session up directly in the shared `admin_sessions` table. There is **no separate credential** for these calls — no `x-adminjs-secret`-style header, no service token. Don't add one; the cookie relay is the whole mechanism. `getApiBaseUrl()` (same file) resolves `API_BASE_URL` — required, no dev-mode shortcut.

**Cookie-forwarding gotcha (already handled, don't re-break it):** the `request` a `Handler` receives is AdminJS's `ActionRequest`, built internally via `Object.assign({}, req)` on the real Express request. On current Node, `IncomingMessage#headers` is a lazy accessor, not an own property, so that shallow copy silently drops it — `request.headers` is **always `undefined`** in a handler, never a valid way to read cookies here. `NestApiClient`'s `importCookies` reads the `Cookie` value out of `request.rawHeaders` instead (an own property that does survive the copy). If you ever need another header from the incoming request in a handler, read it from `rawHeaders` the same way — not `request.headers`.
