# Level27 publish tooling

Manual deploy CLI and GitHub Actions workflow for the Coolest Projects Agency hosting estate on [Level27](https://level27.be). CI calls the same `deploy.mjs` / `deploy-all.mjs` commands as local operators.

## Purpose

Pack monorepo apps into the layout Level27 components already expect, rsync them over SSH, create a remote `.env` **only if it is missing**, and restart Node by sending SIGTERM to `node main.js` so the Agency systemd unit respawns it.

## Stack

- Node.js (`node --test`, no extra workspace)
- `ssh` + `rsync` (run from the Dev Container or another POSIX host)

## Entrypoints

| Path / command | Role |
|----------------|------|
| `node build_tools/bin/deploy.mjs --app api --env dev` | Pack and publish one app |
| `node build_tools/bin/deploy-all.mjs --env dev` | Publish all five test apps (continues on failure) |
| `.github/workflows/deploy-test.yml` | Push to `test-env` or **Run workflow** → `deploy-all --env dev` |
| `node build_tools/bin/deploy.mjs --app api --env prod --dry-run` | Print prod targets; no SSH |
| `npm run test:build-tools` | Unit tests |
| `npm run deploy -- --app api --env dev` | Same single-app CLI via root script |
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

### GitHub Actions (test estate)

Workflow: [`.github/workflows/deploy-test.yml`](../.github/workflows/deploy-test.yml). Triggers on push to `test-env` and `workflow_dispatch`. One job on `ubuntu-latest` (Node 24, `npm ci`, `rsync`). Deploys api → admin → registration → voting → eventguide via `deploy-all.mjs --env dev`. If one app fails, the rest still deploy; the job is red if any failed. Concurrency group `deploy-test` never cancels an in-flight rsync.

**One-time CI setup** (outside git):

1. Generate a dedicated ed25519 key pair for CI.
2. Attach the **public** key to all five `*-dev` components in Level27 CP4 (`nj10446`, `nj10448`, `vd35113` — see table below).
3. In the repo: **Settings → Secrets and variables → Actions**, add repository secret `L27_SSH_PRIVATE_KEY` (full PEM, including headers).
4. Add repository variable `L27_SSH_HOST` (same hostname as local `targets.local.json`).
5. Push to `test-env` or run **Deploy test** from the Actions tab.

CI does not need `build_tools/secrets/*.env` when remote `.env` files already exist. Prod (`--env prod`) is never invoked by this workflow; use `deploy.mjs` manually per app.

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

Smoke for Node: SSH `node -e fetch(...)` to `http://127.0.0.1:<port>/api` (or `/admin`) — not `curl`, which Level27 SSH shells often lack — with up to ~60s of retries while systemd respawns the process. `api-dev.coolestprojects-test.be` may not be in DNS yet. If smoke still fails, check the remote `app/.env` (`DB_HOST` must reach `db-dev`) and whether `node main.js` is running; deploy never overwrites an existing `.env`.

## Talks to

- `apps/api`, `apps/admin`, `packages/database` (build + pack)
- `apps/registration`, `apps/voting`, `apps/eventguide` (static)
- Agency SSH (rsync + Node restart)
- Does not call the Level27 CP4 API (nodejs components reject `{type:restart}`)
- Does not apply OpenTofu; does not create DNS or SSL

## Out of scope / unknowns

- Path-filtered “only changed apps” deploys
- Prod GitHub Actions workflow
- Presentation (no Level27 component)
- Sequelize migrations (`synchronize: true` remains an app concern)
- SSH `known_hosts` pinning (deploy uses `StrictHostKeyChecking=accept-new`)

## Status

Status: stub
