# Level27 publish tooling

Manual deploy CLI for the Coolest Projects Agency hosting estate on [Level27](https://level27.be). GitHub Actions is a later wrapper around this same command.

## Purpose

Pack monorepo apps into the layout Level27 components already expect, rsync them over SSH, create a remote `.env` **only if it is missing**, and restart Node by sending SIGTERM to `node main.js` so the Agency systemd unit respawns it.

## Stack

- Node.js (`node --test`, no extra workspace)
- `ssh` + `rsync` (run from the Dev Container or another POSIX host)

## Entrypoints

| Path / command | Role |
|----------------|------|
| `node build_tools/bin/deploy.mjs --app api --env dev` | Pack and publish |
| `node build_tools/bin/deploy.mjs --app api --env prod --dry-run` | Print prod targets; no SSH |
| `npm run test:build-tools` | Unit tests |
| `npm run deploy -- --app api --env dev` | Same CLI via root script |
| `build_tools/targets.json` | Component IDs, users, paths |
| `build_tools/targets.local.json` | SSH host (gitignored) |
| `build_tools/env/<app>-<env>.env.example` | Known Level27 facts |
| `build_tools/secrets/<app>-<env>.env` | Operator secrets (gitignored) |

Live estate (app `coolestprojects`, id `21746`) is documented in the sibling OpenTofu repo. This CLI does not create components.

### First-time setup

1. Copy `build_tools/targets.local.json.example` to `build_tools/targets.local.json` and set `sshHost` (or export `L27_SSH_HOST`). Attach your SSH key to the component in CP4.
2. Copy keys from `build_tools/env/api-dev.env.example` into `build_tools/secrets/api-dev.env` and fill blanks (`DB_HOST`, `DB_PASSWORD`, JWT, CSRF, …). Get DB host/password from the `db-dev` connection string in CP4.
3. From the Dev Container: `node build_tools/bin/deploy.mjs --app api --env dev`

If remote `app/.env` already exists, deploy leaves it unchanged. If it is missing, deploy uploads `example + secrets` once. Level27 MySQL schema name matches the db user (`db35160` on dest, `db35161` on prod), not `coolestproject`.

### Apps

| `--app` | `--env dev` | Kind |
|---------|-------------|------|
| `api` | `api-dev` (`nj10446`, `app`, port 3001) | Node 24, `node main.js` |
| `admin` | `admin-dev` (`nj10448`, `app`, port 3000) | Node 24, `node main.js` |
| `registration` | `registration-dev` (`vd35113`, `public_html/registration`) | Static (Nuxt generate) |
| `voting` | `voting-dev` (`vd35113`, `public_html/voting`) | Static (Nuxt generate) |
| `eventguide` | `eventguide-dev` (`vd35113`, `public_html/eventguide`) | Static copy |

`--env prod` uses the matching `*-prod` component. Prod is manual only.

Pack Node apps on **Linux** (Dev Container) so `sharp` / `bcrypt` native addons match Agency. Puppeteer Chromium is skipped (`PUPPETEER_SKIP_DOWNLOAD=1`). Admin pack Rollup-builds custom components once, then copies `frontend/assets/components.bundle.js` into the artifact. Dest serves that file; it does not compile AdminJS at boot. `.adminjs/` is rsync-excluded.

Smoke for Node: SSH `curl` to `http://127.0.0.1:<port>/api` (or `/admin`). `api-dev.coolestprojects-test.be` may not be in DNS yet. If Node exits immediately, check the remote `app/.env` (`DB_HOST` must reach `db-dev`); deploy never overwrites an existing `.env`.

## Talks to

- `apps/api`, `apps/admin`, `packages/database` (build + pack)
- `apps/registration`, `apps/voting`, `apps/eventguide` (static)
- Agency SSH (rsync + Node restart)
- Does not call the Level27 CP4 API (nodejs components reject `{type:restart}`)
- Does not apply OpenTofu; does not create DNS or SSL

## Out of scope / unknowns

- GitHub Actions workflow YAML (call this CLI later)
- Presentation (no Level27 component)
- Sequelize migrations (`synchronize: true` remains an app concern)
- Attaching a CI deploy key (components currently have an operator SSH key)

## Status

Status: stub
