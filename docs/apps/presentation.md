# Presentation app

## Purpose

`apps/presentation` itself is still a one-line static placeholder — the real feature lives in `apps/api`'s `presentation` module. It generates a slide deck (event info, per-project slides with room location, a project overview, a floor-map slide, admin-authored custom slides) as PNG images and exposes it over a small delta-sync HTTP API, built for Raspberry Pi devices driving venue displays on unreliable connections. See [docs/apps/api.md](api.md#presentation-slide-deck) for the full design — this doc only covers the placeholder frontend and where a Pi-facing display client would eventually fit.

## Stack

- Static files served with `http-server` (no framework) — currently just a placeholder, not yet a real display client
- `npm run start:dev` → `npx http-server -o /`
- `sync-deck.sh` (+ `systemd/`) — a standalone bash script for the Pi itself, unrelated to the `http-server` placeholder above; see **Deck sync script** below

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/presentation/` | Static site root (placeholder) |
| `npm run start:dev --workspace=apps/presentation` | Dev server (port 3003 in Dev Container) |
| `apps/presentation/sync-deck.sh` | Runs **on the Pi**, not in the dev container — syncs the deck to local disk |

Local URL (via proxy): `https://presentation.coolestprojects.localhost:8443`

## Talks to

- `apps/api` — `PresentationController`/`PresentationService` (`GET /presentation`, `GET`/`HEAD /presentation/:key`), guarded by HTTP Basic auth (`presentation`-type `Account`) — see [api.md](api.md#presentation-slide-deck)
- Does not import `packages/database` directly

## Deck sync script

`sync-deck.sh` is a dependency-light bash script (`curl` + `jq`) meant to run directly on a Raspberry Pi, not in this monorepo's dev container. It polls `GET /presentation`'s per-slide + rollup hashes to decide what changed, downloads only the slides whose hash differs (delta mode), atomically replaces each image on disk, prunes files for slides no longer in the deck, and writes a `manifest.json` a display client can read for order/timing. Every HTTP call retries with backoff (`curl --retry`), and a fully failed pass just waits for the next poll instead of crashing — see the script's own header comment for env vars and usage (`--once` for cron, or its built-in loop otherwise).

`systemd/presentation-sync.service` + `presentation-sync.env.example` run it as a boot-enabled service (`systemctl enable`) so it survives a power outage without anyone touching the device — install steps are in the unit file's header comment.

### Display client: feh

There's no dedicated display app yet (see **Out of scope** below), but `sync-deck.sh` has first-class support for driving [feh](https://feh.finalrewind.org/) as that client, since a plain directory + `feh`'s default sort can't reproduce the deck: slide keys (`slide-11`, `slide-3`, …) don't sort into the real `order`, and feh only has one global slideshow delay, not a per-slide one.

- `FEH_LIST_FILE` (optional env var) — after any pass that changes the deck (including a pure reorder with zero downloads), `sync-deck.sh` writes an ordered `feh -f` filelist here, repeating each slide's path `round(time / FEH_TICK_SECONDS)` times so a fixed `-D FEH_TICK_SECONDS` delay approximates that slide's own `time` (feh redisplaying the same file back-to-back is effectively invisible).
- `ON_DECK_CHANGED_CMD` (optional env var) — a generic post-change hook, run once per pass that actually changed something (not on the unchanged fast path). Point it at `feh-slideshow.sh` to have feh restart automatically, since feh won't notice a changed filelist on its own.
- `feh-slideshow.sh` kills any previously-launched feh and relaunches it fullscreen against `FEH_LIST_FILE`; it's also meant to be run once directly (e.g. from `.xinitrc`) to get the first instance up before any deck change fires.
- Gotcha worth knowing before wiring this into `presentation-sync.service` as templated: that unit runs as a headless, dedicated `presentation` system user with no `DISPLAY`/`Xauthority`, so `ON_DECK_CHANGED_CMD` can't reach feh's X session as-is — see the commented-out section in `presentation-sync.env.example` for the two ways around it. Also, feh is X11-only; Raspberry Pi OS Bookworm's default desktop is Wayland (labwc), so the Pi needs to be switched to the X11 session (or run feh under XWayland) for any of this to work.

## Out of scope / unknowns

- ~~Presentation data format and update mechanism~~ — resolved, see [api.md](api.md#presentation-slide-deck)
- Whether a real, dedicated Raspberry Pi display client lives here (a real app replacing this placeholder) or is a separate, out-of-monorepo project — `sync-deck.sh` only gets the images onto disk and (optionally) drives feh's filelist/restart; there's still no purpose-built display app
- Screen/display mode requirements (resolution/orientation of the venue screens the Pis drive)
- Production hosting

## Status

Status: stub
