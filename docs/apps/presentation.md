# Presentation app

## Purpose

`apps/presentation` is not a web app — it's a shell-script fleet deployed directly on the Raspberry Pi devices driving Coolest Projects venue displays. The real slide-deck generation lives in `apps/api`'s `presentation` module: it renders a slide deck (event info, per-project slides with room location, a project overview, a floor-map slide, admin-authored custom slides) as PNG images and exposes it over a small delta-sync HTTP API built for unreliable venue connections. This workspace is the client side of that API — `sync-deck.sh` pulls the deck onto a Pi's local disk, and `slideshow.sh`/`feh-slideshow.sh`/`imv-slideshow.sh` display it full-screen. See [docs/apps/api.md](api.md#presentation-slide-deck) for the full server-side design.

## Stack

- Bash (`curl` + `jq`), no Node/npm runtime involved on the Pi itself — see **Deck sync script** below
- `apps/presentation/package.json` exists only so this directory is an npm workspace (`npm install`); it has no build or dev-server script

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/presentation/sync-deck.sh` | Runs **on the Pi**, not in the Dev Container — polls the API and syncs the deck to local disk |
| `apps/presentation/slideshow.sh` | Auto-detects Wayland vs X11 and dispatches to the matching display client below — point every device's `ON_DECK_CHANGED_CMD` at this one |
| `apps/presentation/feh-slideshow.sh` / `apps/presentation/imv-slideshow.sh` | Display clients for X11 (feh) / native Wayland (imv) — see **Display client** below |
| `apps/presentation/systemd/presentation-sync.service` | Boot-enabled systemd unit running `sync-deck.sh` on the Pi |

Not proxied by the Dev Container and has no local URL — there is nothing here to browse to.

## Talks to

- `apps/api` — `PresentationController`/`PresentationService` (`GET /presentation`, `GET`/`HEAD /presentation/:key`, `POST /presentation/heartbeat`), guarded by HTTP Basic auth (`presentation`-type `Account`) — see [api.md](api.md#presentation-slide-deck)
- Does not import `packages/database` directly

## Deck sync script

`sync-deck.sh` is a dependency-light bash script (`curl` + `jq`) meant to run directly on a Raspberry Pi, not in this monorepo's dev container. It polls `GET /presentation`'s per-slide + rollup hashes to decide what changed, downloads only the slides whose hash differs (delta mode), atomically replaces each image on disk, prunes files for slides no longer in the deck, and writes a `manifest.json` a display client can read for order/timing. Every HTTP call retries with backoff (`curl --retry`), and a fully failed pass just waits for the next poll instead of crashing — see the script's own header comment for env vars and usage (`--once` for cron, or its built-in loop otherwise).

Each pass also posts a best-effort heartbeat (`POST /presentation/heartbeat`) before syncing — a failure there is logged but never fails the pass or triggers the outer backoff, since the deck sync itself is what matters. This is how staff know which venue devices are actually online: see [api.md](api.md#presentation-slide-deck) for what the API does with it (upserts a `PresentationCheckin` row by account + IP, visible read-only in AdminJS under **Presentation → Presentation check-ins**).

`systemd/presentation-sync.service` + `presentation-sync.env.example` run it as a boot-enabled service (`systemctl enable`) so it survives a power outage without anyone touching the device — install steps are in the unit file's header comment.

### Display client: feh or imv

`sync-deck.sh` has first-class support for driving [feh](https://feh.finalrewind.org/) (X11) or [imv](https://sr.ht/~exec64/imv/) (native Wayland) as the display client — this is the actual display solution, not a placeholder for a future purpose-built app. Neither is wrapped in custom rendering code: a plain directory + default sort can't reproduce the deck (slide keys like `slide-11`, `slide-3`, … don't sort into the real `order`, and both tools only have one global slideshow delay, not a per-slide one), so `sync-deck.sh` does the ordering/timing work itself and hands each tool a filelist it already knows how to play.

The venue fleet is mixed-generation Pis — newer ones (4/5) default to Wayland (labwc) on Bookworm, older ones (Zero/1/2/3, or anything still on Bullseye/Buster) only have X11. `slideshow.sh` auto-detects which session is actually running on a given device (`WAYLAND_DISPLAY` vs `DISPLAY`, preferring native Wayland when both are present) and dispatches to `imv-slideshow.sh` or `feh-slideshow.sh` accordingly — **this is the one script to point every device's `ON_DECK_CHANGED_CMD` at**, so the fleet doesn't need per-device configuration just because some Pis are older than others. `SLIDESHOW_CLIENT=imv`/`feh` overrides the detection if a specific device needs pinning. Use `feh-slideshow.sh`/`imv-slideshow.sh` directly only when deliberately forcing one client (e.g. local testing).

- `SLIDE_LIST_FILE` (optional env var) — after any pass that changes the deck (including a pure reorder with zero downloads), `sync-deck.sh` writes an ordered filelist here (one path per line, repeated each slide's path `round(time / SLIDE_TICK_SECONDS)` times so a fixed `SLIDE_TICK_SECONDS` delay approximates that slide's own `time` — the repeated file redisplaying back-to-back is effectively invisible). Format matches feh(1)'s `-f`/`--filelist`; `imv-slideshow.sh` reads the same file itself, since imv has no equivalent flag.
- `ON_DECK_CHANGED_CMD` (optional env var) — a generic post-change hook, run once per pass that actually changed something (not on the unchanged fast path). Point it at `feh-slideshow.sh` or `imv-slideshow.sh` to have the display client restart automatically, since neither notices a changed filelist on its own.
- `feh-slideshow.sh` kills any previously-launched feh and relaunches it fullscreen (`--filelist`) against `SLIDE_LIST_FILE`; `imv-slideshow.sh` does the same for `imv-wayland` — since imv has no `--filelist` flag (only positional path args), it reads `SLIDE_LIST_FILE` itself and expands it onto imv's argv. Any of the three (`slideshow.sh` included) can also be run once directly at session start (`.xinitrc` for feh, labwc autostart for imv/`slideshow.sh`) to get the first instance up before any deck change fires — `slideshow.sh` there too, for the same mixed-fleet reason: one autostart entry works regardless of which session that particular device ends up in.
- feh is X11-only; Raspberry Pi OS Bookworm's default desktop is Wayland (labwc), so using it means switching the Pi to the X11 session (or running feh under XWayland). `imv-slideshow.sh` avoids that by calling `imv-wayland` directly — Debian's imv package ships separate `imv-wayland`/`imv-x11` binaries and deliberately omits upstream's auto-detecting `imv` wrapper (name clash with `renameutils`), so the binary must be named explicitly to actually get native Wayland.
- Gotcha worth knowing before wiring either into `presentation-sync.service` as templated: that unit runs as a headless, dedicated `presentation` system user with no `DISPLAY`/`Xauthority` (feh) or `WAYLAND_DISPLAY`/`XDG_RUNTIME_DIR` (imv), so `ON_DECK_CHANGED_CMD` can't reach either session as-is — see the commented-out section in `presentation-sync.env.example` for the two ways around it (written with feh's env vars; the same shape applies to imv's).
- Not handled by either script: disabling screen blanking (feh: `xset`, X11-only; imv: no portable client-side equivalent — configure the compositor, e.g. labwc's `rc.xml`, directly) or hiding the idle pointer (feh: `--hide-pointer`; most Wayland compositors, including labwc, already do this on their own).

## Out of scope / unknowns

- ~~Presentation data format and update mechanism~~ — resolved, see [api.md](api.md#presentation-slide-deck)
- ~~Whether a real, dedicated Raspberry Pi display client lives here or is a separate, out-of-monorepo project~~ — resolved: it lives here, as this shell-script fleet (`sync-deck.sh` + `slideshow.sh`/`feh-slideshow.sh`/`imv-slideshow.sh`), not a web app
- Screen/display mode requirements (resolution/orientation of the venue screens the Pis drive)
- Production hosting (how/where the fleet's Pis are provisioned and managed — imaging, remote access, fleet inventory)

## Status

Status: deep
