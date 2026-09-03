# Level27 publish tooling

Manual deploy CLI and GitHub Actions workflows for the Coolest Projects Agency hosting estate on [Level27](https://level27.be). CI calls the same `deploy.mjs` / `deploy-all.mjs` commands as local operators.

## Purpose

Pack monorepo apps into the layout Level27 components already expect, rsync them over SSH, create a remote `.env` **only if it is missing**, apply admin SQL views on **api** deploy, and restart Node by sending SIGTERM to `node main.js` so the Agency systemd unit respawns it.

## Stack

- Node.js (`node --test`, no extra workspace)
- `ssh` + `rsync` (run from the Dev Container or another POSIX host)

## Entrypoints

| Path / command | Role |
|----------------|------|
| `node build_tools/bin/deploy.mjs --app api --env dev` | Pack and publish one app |
| `node build_tools/bin/deploy-all.mjs --env dev` | Publish all five test apps (continues on failure) |
| `node build_tools/bin/deploy-all.mjs --env prod` | Publish all five production apps |
| `.github/workflows/deploy-test.yml` | Push to `test-env` or **Run workflow** → `deploy-all --env dev` |
| `.github/workflows/deploy-prod.yml` | Push to `production` or **Run workflow** → `deploy-all --env prod` |
| `node build_tools/bin/deploy.mjs --app api --env prod --dry-run` | Print prod targets; no SSH |
| `npm run test:build-tools` | Unit tests |
| `npm run deploy -- --app api --env dev` | Same single-app CLI via root script |
| `build_tools/targets.json` | Component IDs, users, paths |
| `build_tools/targets.local.json` | SSH host (gitignored) |
| `build_tools/env/<app>-<env>.env.example` | Known Level27 facts |
| `build_tools/secrets/<app>-<env>.env` | Operator secrets (gitignored) |

Live estate (app `coolestprojects`, id `21746`) is documented in the sibling OpenTofu repo. This CLI does not create components.

### Release flow

```text
feature branch → merge test-env    → CI deploys dev → verify
              → merge production → CI deploys prod → verify
```

Test and prod use the **same** deploy script. Schema changes are applied automatically on api deploy (see [Database package](packages/database.md)).

### First-time setup

1. Copy `build_tools/targets.local.json.example` to `build_tools/targets.local.json` and set `sshHost` (or export `L27_SSH_HOST`). Attach your SSH key to the component in CP4.
2. Copy keys from `build_tools/env/api-dev.env.example` into `build_tools/secrets/api-dev.env` and fill blanks (`DB_HOST`, `DB_PASSWORD`, JWT, CSRF, …). Get DB host/password from the `db-dev` connection string in CP4.
3. From the Dev Container: `node build_tools/bin/deploy.mjs --app api --env dev`

If remote `app/.env` already exists, deploy leaves it unchanged. If it is missing, deploy uploads `example + secrets` once. Level27 MySQL schema name matches the db user (`db35160` on dest, `db35161` on prod), not `coolestproject`.

**Existing api `.env` files:** add `DB_SYNC_ALTER=true` manually on api-dev and api-prod so model changes apply on API restart (deploy does not overwrite `.env`).

### GitHub Actions (test estate)

Workflow: [`.github/workflows/deploy-test.yml`](../.github/workflows/deploy-test.yml). Triggers on push to `test-env` and `workflow_dispatch`. One job on `ubuntu-latest` (Node 24, `npm ci`, `rsync`). Deploys api → admin → registration → voting → eventguide via `deploy-all.mjs --env dev`. If one app fails, the rest still deploy; the job is red if any failed. Concurrency group `deploy-test` never cancels an in-flight rsync.

**One-time CI setup** (outside git):

1. Generate a dedicated ed25519 key pair for CI.
2. Attach the **public** key to all five `*-dev` components in Level27 CP4 (`nj10446`, `nj10448`, `vd35113` — see table below).
3. In the repo: **Settings → Secrets and variables → Actions**, add repository secret `L27_SSH_PRIVATE_KEY` (full PEM, including headers).
4. Add repository variable `L27_SSH_HOST` (same hostname as local `targets.local.json`).
5. Push to `test-env` or run **Deploy test** from the Actions tab.

CI does not need `build_tools/secrets/*.env` when remote `.env` files already exist.

### GitHub Actions (production)

Workflow: [`.github/workflows/deploy-prod.yml`](../.github/workflows/deploy-prod.yml). Triggers on push to `production` and `workflow_dispatch`. Same shape as the test workflow: one job on `ubuntu-latest` (Node 24, `npm ci`, `rsync`). Deploys api → admin → registration → voting → eventguide via `deploy-all.mjs --env prod`. Concurrency group `deploy-prod` never cancels an in-flight rsync.

**One-time prod CI setup:**

1. Attach the same CI **public** SSH key to all five `*-prod` components (`nj10447`, `nj10449`, `vd35114`).
2. Ensure api-prod remote `.env` includes `DB_SYNC_ALTER=true` (see env example).
3. Push to `production` or run **Deploy production** from the Actions tab.

### Schema on deploy (api only)

After rsync, before API restart:

1. SSH: `node apply-views.cjs` in the remote `app/` directory (reads `sql-views/` bundled from `apps/admin/src/components/admin/SQL-data/`).
2. API restart runs Sequelize with `DB_SYNC_ALTER=true` → `sync({ alter: true })` for model/table columns.

Skip view apply: `deploy.mjs --skip-views`.

### Apps

| `--app` | `--env dev` | `--env prod` | Kind |
|---------|-------------|--------------|------|
| `api` | `api-dev` (`nj10446`) | `api-prod` (`nj10447`) | Node 24, `node main.js` |
| `admin` | `admin-dev` (`nj10448`) | `admin-prod` (`nj10449`) | Node 24, `node main.js` |
| `registration` | `registration-dev` (`vd35113`) | `registration-prod` (`vd35114`) | Static (Nuxt generate) |
| `voting` | `voting-dev` (`vd35113`) | `voting-prod` (`vd35114`) | Static (Nuxt generate) |
| `eventguide` | `eventguide-dev` (`vd35113`) | `eventguide-prod` (`vd35114`) | Static copy |
| `cdj-web-int` | `cdj-web-int` on `static-dev` (`vd35113`) | `cdj-web-int` on `static-prod` (`vd35114`) | Static copy; operator-only deploy |

`cdj-web-int` is **not** in `deploy-all`. Run `npm run archive-cpbe` (downloads gitignored photos), then `npm run deploy -- --app cdj-web-int --env prod` (rsync to `public_html/cdj-web-int`). Pack fails if `apps/cdj-web-int/images/` is empty.

Pack Node apps on **Linux** (Dev Container) so `sharp` / `bcrypt` native addons match Agency. Puppeteer Chromium is skipped (`PUPPETEER_SKIP_DOWNLOAD=1`). Admin pack Rollup-builds custom components once, then copies `frontend/assets/components.bundle.js` into the artifact. Dest serves that file; it does not compile AdminJS at boot. `.adminjs/` is rsync-excluded.

Smoke for Node: `fetch` the component `publicUrl` + `smokePath` (e.g. `https://api-dev.coolestprojects-test.be/api`) from the deploy runner, with up to ~60s of retries while systemd respawns the process. Do not probe `127.0.0.1:<port>` over SSH — Level27 Node components listen in an isolated network namespace (`IP_NS`), so localhost from the SSH shell never reaches the app. If smoke still fails, check the remote `app/.env` (`DB_HOST` must reach `db-dev`) and whether `node main.js` is running; deploy never overwrites an existing `.env`.

## Talks to

- `apps/api`, `apps/admin`, `packages/database` (build + pack)
- `apps/registration`, `apps/voting`, `apps/eventguide` (static)
- Agency SSH (rsync + Node restart)
- MySQL (view SQL via api deploy; DDL via API `DB_SYNC_ALTER` on restart)
- Does not call the Level27 CP4 API (nodejs components reject `{type:restart}`)
- Does not apply OpenTofu; does not create DNS or SSL

## Out of scope / unknowns

- Path-filtered “only changed apps” deploys
- Presentation (no Level27 component)
- SSH `known_hosts` pinning (deploy uses `StrictHostKeyChecking=accept-new`)

## Status

Status: stub
