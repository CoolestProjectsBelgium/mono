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

# Puppeteer (used by apps/api for presentation PDF export) needs the Chrome
# binary itself — its shared library runtime deps are baked into the image
# (see dockerfile_workspace/Dockerfile) so they don't need reinstalling here.
# The browser binary itself lands in the puppeteer-cache volume, so this is a
# no-op after the first container start.
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
npm run start:dev --workspace=apps/registration -- -p 3004 &
npm run start:dev --workspace=apps/voting -- -p 3005 &

# Keep container running
wait