# CDJ web INT gallery app

## Purpose

Self-contained static archive of the public Coolest Projects Belgium project galleries (2021–2026). Published to Level27 **static-prod** (`vd35114`) at `public_html/cdj-web-int` so the site keeps working after Azure blob SAS tokens expire.

## Stack

- Static HTML/JS (Bootstrap accordion cards, same UX as the legacy CoderDojo `/cpbe/` pages)
- `http-server` for local preview
- Dump script: `scripts/archive-cpbe/dump.mjs` fetches planning JSON + photos from the legacy backend

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/cdj-web-int/` | Static site root (HTML, JS, `data/`, `vendor/`, `banners/`) |
| `npm run archive-cpbe` | Download JSON, rewrite paths, fetch images, vendor assets |
| `npm run archive-cpbe:test` | Unit tests for dump/rewrite helpers |
| `npm run start:dev --workspace=apps/cdj-web-int` | Local preview |
| `npm run deploy -- --app cdj-web-int --env prod` | Rsync to `static-prod` (`public_html/cdj-web-int`) |

Participant photos live in `apps/cdj-web-int/images/` (gitignored). Run `archive-cpbe` before deploy so pack can include them.

## Talks to

- Legacy read-only HTTP: `backend.coolestprojects.be/website/planning/{id}/projects.json` (dump only)
- Azure blob storage (dump only, via `pic` URLs)
- Level27 `static-prod` / `static-dev` via [build-tools.md](../build-tools.md) (`build_tools/`)
- Does not call `apps/api` or `packages/database`

## Out of scope / unknowns

- Public URL routing from `coderdojobelgium.be/cpbe` to `static-prod` (Level27/DNS config outside this repo)
- GitHub Actions / `deploy-all` for `cdj-web-int` (operator deploy only)
- 2020 page (`projects20.html` has no planning JSON)
- Planning IDs 0, 7, 8, 9 (empty JSON)
- 2021 gallery photos (Azure blobs for planning/1 return 404; project text still works)

## Status

Status: stub
