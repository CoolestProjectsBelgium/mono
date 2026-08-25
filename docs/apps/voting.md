# Voting app

## Purpose

Nuxt 3 frontend for Coolest Projects Belgium voting. Lets judges or participants interact with voting flows backed by the shared API.

## Stack

- Nuxt 3, Vue 3, TypeScript
- Pinia (`@pinia/nuxt`, persisted state plugin)
- Nuxt UI, Vitest

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/voting/pages/` | File-based routes |
| `apps/voting/stores/` | Pinia stores |
| `apps/voting/composables/` | Shared composables |
| `apps/voting/middleware/` | Route middleware |
| `apps/voting/nuxt.config.ts` | Nuxt configuration |
| `npm run dev --workspace=apps/voting` | Dev server (port 3005 in Dev Container) |

Local URL (via proxy): `https://voting.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — voting endpoints (`VotingController` / `VotingService`)
- Does not import `packages/database` directly

## Out of scope / unknowns

- Exact voting UX flows and API contract details (expand when implementing features)
- Production deploy is Level27 `voting-dev` / `voting-prod` via [build-tools.md](../build-tools.md)
- Auth/session mechanism between Nuxt and API

## Status

Status: stub
