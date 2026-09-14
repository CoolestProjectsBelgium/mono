#!/bin/bash

# Trust the dev CA inside the container so server-side Node code (and curl/git)
# accept the proxy's TLS cert on *.coolestprojects.localhost, same as the host
# browser does after installing pki/ca.crt manually (see .devcontainer/certs/README.md).
# Done here rather than in the Dockerfile: the repo (and its certs/) is only
# available via the runtime bind mount, not the image build context.
cp .devcontainer/certs/pki/ca.crt /usr/local/share/ca-certificates/coolestprojects-dev-ca.crt
update-ca-certificates

# docker-compose.yml sets NODE_OPTIONS=--use-system-ca on the workspace
# service for exactly this reason, but that only reaches the container's
# own init process — postStartCommand (this script) runs via a separate
# `docker exec`-style attach that does not inherit it, so every app
# started below (admin's NestApiClient calls to the API over the proxy,
# in particular) would otherwise fail with "unable to verify the first
# certificate". Re-asserted here so it reliably reaches every child this
# script backgrounds, regardless of how this script itself was invoked.
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--use-system-ca"

# Puppeteer (used by apps/api for presentation PDF export) needs both the Chrome
# binary itself and, since the base image ships no browser runtime deps, the
# shared libraries Chrome links against at launch (e.g. libnspr4/libnss3) —
# without these it downloads fine but fails with "error while loading shared
# libraries" at launch time.
apt-get update -qq
apt-get install -y --no-install-recommends \
	libnspr4 libnss3 libnss3-tools libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 \
	libxfixes3 libxrandr2 libpango-1.0-0 libpangocairo-1.0-0 libcairo2 \
	libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libgtk-3-0t64 libglib2.0-0t64
rm -rf /var/lib/apt/lists/*
npx puppeteer browsers install chrome

# update-ca-certificates above only covers OpenSSL-based tools (Node's https
# module, curl). Chrome/Chromium — including the one Playwright drives for
# e2e/ (see docs/e2e/README.md) — reads its trust roots from an NSS
# certificate database instead and ignores /etc/ssl/certs entirely, so it
# needs the CA imported separately or every test run fails with
# net::ERR_CERT_AUTHORITY_INVALID. Needs libnss3-tools (certutil), just
# installed above.
mkdir -p "$HOME/.pki/nssdb"
certutil -N -d "sql:$HOME/.pki/nssdb" --empty-password 2>/dev/null || true
certutil -A -n coolestprojects-dev-ca -t "C,," \
	-i .devcontainer/certs/pki/ca.crt -d "sql:$HOME/.pki/nssdb"

npm i -g @nestjs/cli

# build database package
npm run build --workspace=packages/database

# build the api cli
npm run build --workspace=apps/api

# copy demo images to project 1 folder
if [[ -n "${UPLOAD_ROOT:-}" ]]; then
	mkdir -p "$UPLOAD_ROOT/coolestprojects/project_1"
	cp -R .devcontainer/images/. "$UPLOAD_ROOT/coolestprojects/project_1/"
fi

# load test db
npm run seed-db --workspace=apps/api

# Start Admin app
npm run start:dev  --workspace=apps/admin &

# Start API backend (built dist — nest --watch can serve stale cookie/auth code)
#nohup node apps/api/dist/main.js > /tmp/api.log 2>&1 &
npm run start:dev  --workspace=apps/api > /tmp/api.log 2>&1 &

# Start Static apps
npm run start:dev --workspace=apps/eventguide -- -p 3002 &
npm run start:dev --workspace=apps/presentation -- -p 3003 &
npm run start:dev --workspace=apps/registration -- -p 3004 &
npm run start:dev --workspace=apps/voting -- -p 3005 &

# Keep container running
wait