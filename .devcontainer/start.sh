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

# build database package
npm run build --workspace=packages/database

# build the api cli
npm run build --workspace=apps/api

# Reset + reseed the dev db (npm run seed-db -> event:init -> seedDatabase).
# This also copies each demo project's photo(s) into its own upload folder
# (event 1, project_1, project_2, ... — real project IDs, not a hardcoded
# project_1) via seed-project-pictures.ts, so no separate copy step is
# needed here.
npm run seed-db --workspace=apps/api

# Every app's output is mirrored to /tmp/<name>.log (same paths as
# restart-apps.sh / rebuild-all.sh) so warnings can be read back later,
# not only in this terminal. Ports come from each app's own start:dev script.
start_app() {
  npm run start:dev --workspace="apps/$1" 2>&1 | tee "/tmp/$1.log" &
}

# Start Admin app
start_app admin

# Start API backend in watch mode (`nest start --watch`, via the workspace's
# own @nestjs/cli). Log file only: use `tail -f /tmp/api.log` to follow it.
# restart-apps.sh / rebuild-all.sh run the built dist instead.
npm run start:dev --workspace=apps/api > /tmp/api.log 2>&1 &

# Start Static apps
start_app eventguide
start_app registration
start_app voting

# Keep container running
wait
