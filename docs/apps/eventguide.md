# Event guide app

## Purpose

Static event guide site served locally for attendees to browse event information. Expected to consume API data at runtime or via static assets (exact integration TBD).

## Stack

- Static files served with `http-server` (no framework)
- `npm run start:dev` → `npx http-server -o /`

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/eventguide/` | Static site root |
| `npm run start:dev --workspace=apps/eventguide` | Dev server (port 3002 in Dev Container) |

Local URL (via proxy): `https://eventguide.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `EventguideController` / `EventguideService` (expected consumer)
- Does not import `packages/database` directly

## Out of scope / unknowns

- Static asset layout and build pipeline (if any beyond `http-server`)
- Which API endpoints the guide calls
- Production hosting (Level27 `eventguide-dev` / `eventguide-prod` via [build-tools.md](../build-tools.md))

## Status

Status: stub
