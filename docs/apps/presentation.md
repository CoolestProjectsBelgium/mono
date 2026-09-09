# Presentation app

## Purpose

`apps/presentation` itself is still a one-line static placeholder — the real feature lives in `apps/api`'s `presentation` module. It generates a slide deck (event info, per-project slides with room location, a project overview, a floor-map slide, admin-authored custom slides) as PNG images and exposes it over a small delta-sync HTTP API, built for Raspberry Pi devices driving venue displays on unreliable connections. See [docs/apps/api.md](api.md#presentation-slide-deck) for the full design — this doc only covers the placeholder frontend and where a Pi-facing display client would eventually fit.

## Stack

- Static files served with `http-server` (no framework) — currently just a placeholder, not yet a real display client
- `npm run start:dev` → `npx http-server -o /`

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/presentation/` | Static site root (placeholder) |
| `npm run start:dev --workspace=apps/presentation` | Dev server (port 3003 in Dev Container) |

Local URL (via proxy): `https://presentation.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `PresentationController`/`PresentationService` (`GET /presentation`, `GET`/`HEAD /presentation/:key`), guarded by HTTP Basic auth (`presentation`-type `Account`) — see [api.md](api.md#presentation-slide-deck)
- Does not import `packages/database` directly

## Out of scope / unknowns

- ~~Presentation data format and update mechanism~~ — resolved, see [api.md](api.md#presentation-slide-deck)
- Whether the actual Raspberry Pi display client lives here (a real app replacing this placeholder) or is a separate, out-of-monorepo project that just consumes the API
- Screen/display mode requirements (resolution/orientation of the venue screens the Pis drive)
- Production hosting

## Status

Status: stub
