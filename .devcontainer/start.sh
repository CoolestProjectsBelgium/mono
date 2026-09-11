#!/bin/bash

# Trust the dev CA inside the container so server-side Node code (and curl/git)
# accept the proxy's TLS cert on *.coolestprojects.localhost, same as the host
# browser does after installing pki/ca.crt manually (see .devcontainer/certs/README.md).
# Done here rather than in the Dockerfile: the repo (and its certs/) is only
# available via the runtime bind mount, not the image build context.
cp .devcontainer/certs/pki/ca.crt /usr/local/share/ca-certificates/coolestprojects-dev-ca.crt
update-ca-certificates

# `update-ca-certificates` only updates the OS trust store — Node's own TLS
# stack (used by axios in apps/admin's NestApiClient, e.g. for the floorplan/
# presentation-assets admin pages) ignores it and ships its own bundled root
# list, so without this every outbound HTTPS call through the proxy to
# *.coolestprojects.localhost fails with "unable to verify the first
# certificate". Exported here so every background process started below
# inherits it.
export NODE_EXTRA_CA_CERTS="$(pwd)/.devcontainer/certs/pki/ca.crt"

# Puppeteer (used by apps/api for presentation PDF export) needs both the Chrome
# binary itself and, since the base image ships no browser runtime deps, the
# shared libraries Chrome links against at launch (e.g. libnspr4/libnss3) —
# without these it downloads fine but fails with "error while loading shared
# libraries" at launch time.
apt-get update -qq
apt-get install -y --no-install-recommends \
	libnspr4 libnss3 libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 \
	libxfixes3 libxrandr2 libpango-1.0-0 libpangocairo-1.0-0 libcairo2 \
	libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libgtk-3-0t64 libglib2.0-0t64
rm -rf /var/lib/apt/lists/*
npx puppeteer browsers install chrome

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