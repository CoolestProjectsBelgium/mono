# End-to-end tests

Playwright, Chromium only. Lives in the `e2e/` npm workspace at the repo root; this page is the scenario catalog and the "how to run" reference — see [../proposals/user-docs-and-e2e-testing.md](../proposals/user-docs-and-e2e-testing.md) for why this exists and the framework choice.

## Scenarios

| Scenario | App | Status | Spec |
|----------|-----|--------|------|
| [registration.md](scenarios/registration.md) | registration | automated | `e2e/tests/registration.spec.ts` |

Status is one of: `documented only` (no test yet), `manually verified` (checked by hand, not automated), `automated` (a Playwright spec covers it — linked).

## Running today (dev environment only)

This first step targets the Dev Container's own dev servers **through its TLS proxy** (`https://<app>.coolestprojects.localhost:8443`, see `.devcontainer/certs/README.md` and `.devcontainer/dockerfile_proxy`) — not the bare `localhost:<port>` dev-server ports directly. That's mandatory, not a style choice: `apps/api` sets `COOKIE_DOMAIN=coolestprojects.localhost`, and admin's session cookie is `Secure` (HTTPS-only) — a plain `localhost:<port>` origin can't receive either kind of cookie correctly, so any auth/session-dependent flow would silently misbehave. The same proxy origins are also what mailed links and cross-app API calls (`CORS_ORIGINS`, `API_BASE_URL`) already use, so testing through them is what actually matches production behavior.

The Dev Container's proxy uses a self-signed dev CA (`.devcontainer/certs/pki/ca.crt`). `.devcontainer/start.sh` trusts it for both server-side Node/curl (`update-ca-certificates`) **and** for the Chromium browser Playwright drives, which reads a separate NSS certificate database rather than the OpenSSL store (`certutil -A ... -d sql:$HOME/.pki/nssdb`) — both happen automatically on container start, nothing to do by hand. `playwright.config.ts` deliberately does **not** set `ignoreHTTPSErrors`, so a real cert problem still fails loudly instead of being silently masked.

1. Make sure the Dev Container's proxy + the app(s) you're testing are up (per [local-setup.md](../local-setup.md)) — the proxy container serves `*.coolestprojects.localhost:8443` and routes to each app's dev-server port; starting an app's dev server standalone (e.g. `docker exec ... npm run start:dev --workspace=apps/registration -- -p 3004`) is **not** enough on its own for e2e runs, since the proxy is what serves the actual test origin.
2. From the repo root: `npm test --workspace=e2e` (or `npx playwright test` from inside `e2e/`). First time, install the browser: `npx playwright install --with-deps chromium` from `e2e/`.
3. Run one spec / one project: `npx playwright test tests/registration.spec.ts --project=registration`.

Each Playwright `project` in `e2e/playwright.config.ts` points at one app's proxy subdomain (`admin`, `eventguide`, `registration`, `voting` — same app↔port mapping as `CLAUDE.md`'s port table, just reached via the proxy instead of directly). If the proxy or that app's dev server isn't running, the test fails with a connection error, not a Playwright config error.

## Out of scope (for now)

- CI wiring (no GitHub Actions workflow runs these yet).
- Booting apps automatically (`webServer` in the Playwright config) — a natural next step once this moves to CI.
- `admin` login-flow coverage, and `presentation`/`cdj-web-int` projects — not included in the first cut.
