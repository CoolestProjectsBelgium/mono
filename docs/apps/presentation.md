# Presentation app

## Purpose

Static presentation site for displaying project or event presentation content during Coolest Projects.

## Stack

- Static files served with `http-server` (no framework)
- `npm run start:dev` → `npx http-server -o /`

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/presentation/` | Static site root |
| `npm run start:dev --workspace=apps/presentation` | Dev server (port 3003 in Dev Container) |

Local URL (via proxy): `https://presentation.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `PresentationController` / `PresentationService`
- Does not import `packages/database` directly

## Out of scope / unknowns

- Presentation data format and update mechanism
- Screen/display mode requirements
- Production hosting

## Status

Status: stub
