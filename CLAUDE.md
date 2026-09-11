# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Use [AGENTS.md](AGENTS.md) as the agent map for this monorepo.

- Documentation hub: [docs/README.md](docs/README.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Local setup: [docs/local-setup.md](docs/local-setup.md)

Do not duplicate architecture here — `docs/` is the source of truth.

## Commands

npm workspaces monorepo — run from repo root, targeting a workspace with `--workspace=<path>` (`apps/api`, `apps/admin`, `apps/voting`, `apps/registration`, `apps/eventguide`, `apps/presentation`, `apps/cdj-web-int`, `packages/database`).

```bash
npm install                          # install all workspaces
npm run check-docs                   # verify docs/ index (missing files, headings, broken links)
npm run build --workspace=apps/api   # build one workspace (also: admin, voting, registration, eventguide, packages/database)
npm test --workspace=apps/api        # test one workspace (see runners below)
```

No workspace defines a `lint` script.

Test runners differ per workspace:

| Workspace | Runner | Run a single test |
|-----------|--------|--------------------|
| `apps/api` | Jest (`*.spec.ts` under `src/`) | `npm test --workspace=apps/api -- path/to/file.spec.ts` |
| `apps/voting`, `apps/registration`, `apps/eventguide` | Vitest | `npm test --workspace=apps/voting -- path/to/file.spec.ts` |
| `apps/admin` | `tsx --test` (explicit glob list in its `test` script) | `npx tsx --test apps/admin/src/api/foo.spec.ts` (run from repo root) |
| `packages/database`, `apps/presentation`, `apps/cdj-web-int` | none | — |

Root-level scripts: `npm run archive-cpbe`, `npm run archive-cpbe:test` (`scripts/archive-cpbe/`), `npm run deploy` (Level27 publish, see [docs/build-tools.md](docs/build-tools.md)).

## Dev servers

Dev servers run **inside the Dev Container only** (`coolestproject-dev-workspace`), never on the host — see [docs/local-setup.md](docs/local-setup.md). To restart one after a material change:

```bash
docker exec coolestproject-dev-workspace bash -lc "
  fuser -k <PORT>/tcp 2>/dev/null || true
  cd /workspace && nohup npm run start:dev --workspace=apps/<name> -- -p <PORT> > /tmp/<name>.log 2>&1 &
"
```

Ports: `api` 3001, `admin` 3000, `eventguide` 3002, `presentation` 3003, `registration` 3004, `voting` 3005. Skip restart for test-only, doc-only, or comment-only edits.
