# Registration app

## Purpose

Static registration site for participants signing up for Coolest Projects events.

## Stack

- Static files served with `http-server` (no framework)
- `npm run start:dev` → `npx http-server -o /`

## Entrypoints

| Path / command | Role |
|----------------|------|
| `apps/registration/` | Static site root |
| `npm run start:dev --workspace=apps/registration` | Dev server (port 3004 in Dev Container) |

Local URL (via proxy): `https://registration.coolestprojects.localhost:8443`

File uploads may be proxied separately (see `.devcontainer/dockerfile_proxy/proxy_templates/proxy.conf` — `/files` bypass).

## Talks to

- `apps/api` — `RegistrationController`, `LoginController`, `ProjectinfoController`, `UserinfoController`
- Does not import `packages/database` directly

## Out of scope / unknowns

- Multi-step registration UX and validation rules
- File upload client integration
- Production URL (`FILE_BASE_URL` in API env)

## Status

Status: stub
