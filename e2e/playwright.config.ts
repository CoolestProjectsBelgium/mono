import { defineConfig, devices } from '@playwright/test';

// First step: dev-environment only. Targets the Dev Container's own dev
// servers through its TLS proxy (see docs/local-setup.md,
// .devcontainer/certs/README.md, .devcontainer/dockerfile_proxy) — no
// `webServer` here, so it does not start them itself, and this isn't wired
// into CI yet. Chromium only, matching the existing Puppeteer precedent in
// apps/api (see docs/proposals/user-docs-and-e2e-testing.md).
//
// Deliberately *not* http://localhost:<port>: apps/api sets
// COOKIE_DOMAIN=coolestprojects.localhost (.devcontainer/docker-compose.yml)
// and admin's session cookie is `secure: 'auto'` (Secure on HTTPS only, see
// apps/admin/src/index.ts) — a bare localhost:<port> origin can't receive a
// Domain=coolestprojects.localhost cookie at all, and can't get a Secure one
// either. Registration/voting/eventguide's own cross-app API calls
// (CORS_ORIGINS, API_BASE_URL) are configured for the same
// *.coolestprojects.localhost:8443 origins, which is also what mailed links
// point at — so testing through localhost:<port> would silently diverge
// from both real cookie behavior and real link/mail content.
//
// Requires .devcontainer/certs/pki/ca.crt trusted by the browser Playwright
// launches, not just by curl/Node — Chromium reads an NSS certificate
// database, not /etc/ssl/certs, so it needs a separate import. Dev Container
// does this automatically (.devcontainer/start.sh, `certutil -A ... -d
// sql:$HOME/.pki/nssdb`); deliberately no `ignoreHTTPSErrors` here — that
// would blindly accept *any* cert, not just this CA, and would silently mask
// the real bug this setup once had (issued certs missing SAN, see
// .devcontainer/certs/pki/vars) instead of catching it.
const PROXY_PORT = 8443;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    // testMatch scopes each project to its own app's specs (filename prefix
    // convention: tests/<project>*.spec.ts) so one app's spec never
    // accidentally runs — with a different baseURL — against another app.
    // admin/eventguide/voting have no specs yet (first step covers
    // registration only); they'll just report "no tests found" until one is
    // added, not an error.
    {
      name: 'admin',
      testMatch: 'admin*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `https://admin.coolestprojects.localhost:${PROXY_PORT}`,
      },
    },
    {
      name: 'eventguide',
      testMatch: 'eventguide*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `https://eventguide.coolestprojects.localhost:${PROXY_PORT}`,
      },
    },
    {
      name: 'registration',
      testMatch: 'registration*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `https://registration.coolestprojects.localhost:${PROXY_PORT}`,
      },
    },
    {
      name: 'voting',
      testMatch: 'voting*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `https://voting.coolestprojects.localhost:${PROXY_PORT}`,
      },
    },
  ],
});
