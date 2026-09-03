# Legacy Azure dump → production schema

One-time converter that maps the Azure MySQL `voting` dump (Coolest Projects 2021–2026) onto the current Sequelize models and writes `converted.sql` for an **empty** Level27 `db-prod`.

## Purpose

Load historical events, participants, projects, jury votes, seating, and attachment **metadata** into the new schema. The real Azure dump stays out of git. Files on Azure are **not** copied.

## Stack

- Docker MySQL 8.4 (`scripts/legacy-import/docker-compose.yml`) — schemas `legacy` (source) and `target` (Sequelize)
- Node (`mysql2`, `@coolestprojects/database` models)
- `node --test` for mapper unit tests

## Entrypoints

| Path / command | Role |
|----------------|------|
| `npm run legacy-import:test` | Mapper tests (no Docker) |
| `npm run legacy-import -- --fixture --up` | Convert the anonymized fixture |
| `npm run legacy-import -- --up --dump path/to/azure_backup_20260901.sql` | Convert a real dump |
| `scripts/legacy-import/convert.mjs` | Load → map → insert → `mysqldump` |
| `scripts/legacy-import/fixtures/legacy-mini.sql` | Anonymized mini source (no PII) |
| `scripts/legacy-import/out/converted.sql` | Output (gitignored) |

Default MySQL: `127.0.0.1:3307`, user `root`, password `legacy`. Override with `LEGACY_IMPORT_HOST` / `PORT` / `USER` / `PASSWORD`. From the Dev Container workspace, use `LEGACY_IMPORT_HOST=host.docker.internal` (the conversion MySQL is published on the host).

Build models first if you run the script directly: `npm run build --workspace=packages/database`.

See [packages/database.md](packages/database.md) for table names and [build-tools.md](build-tools.md) for Level27 `db-prod`. Do not use the Dev Container database from [local-setup.md](local-setup.md).

## Talks to

- Local Docker MySQL only (not the Dev Container `coolestproject` database, not production)
- Sequelize models in `packages/database`

## What is imported

Events 1–6 (IDs preserved). Users, projects, `UserProjects` (owner + vouchers), accounts **without password hashes**, jury votes, awards, assigned tables, attachment rows, questions/t-shirts, certificates, messages. YouTube `hyperlinks` are appended to `Project.internalInformation`.

## What is dropped

`mysql` system schema, `archief` (2019), `publicvotes`, unused `tables`, `locations`, `azureblobs` table (size is copied onto attachments), views, `statistics-update`, `sessions`, empty `registrations`. No historical `Affiliation` rows. User street/house/box columns have no destination.

## Production load

1. Ensure `db-prod` is **empty**.
2. Load `converted.sql`.
3. **Do not** run `npm run seed-db` / `event:init` (it force-syncs and reseeds).
4. **Do not** start the API yet — `InfoInterceptor` throws `No Active Event` until a current event exists. AdminJS talks to MySQL directly and can list historical events once you can log in.

### After import (MySQL, operator)

There is no Event 7 and no working admin password in the dump.

1. Hash a password with bcrypt cost 12 (same as `Account.hashPassword`).
2. `UPDATE Accounts SET encryptedPassword = '<hash>' WHERE email = '<an imported super_admin>' AND account_type = 'super_admin';`
3. `INSERT` Event 7 with `eventBeginDate < now < eventEndDate`, `floorplanPath`, `allowedMimeTypes`, `folderName`, voting dates, etc.
4. In AdminJS, create t-shirts, questions, email templates, and affiliations for Event 7.
5. Start API + admin. `GET /settings` should return 200.

## AdminJS check (fixture)

After `--fixture --up`, point a throwaway AdminJS (or phpMyAdmin on port 3307) at database `target`. You should see event **Coolest Projects 2021** and project **Robot Cat**. Do not retarget the Dev Container admin at this database.

## Out of scope / unknowns

- Azure blob download and thumbnail generation (attachment `filepath` is a logical path; files 404 until a later job)
- 2019 `archief`
- Bootstrap admin password or Event 7 inside the dump
- Changing `InfoInterceptor` so a current event is optional

## Status

Status: stub
