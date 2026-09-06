#!/bin/bash

# Trust the dev CA inside the container so server-side Node code (and curl/git)
# accept the proxy's TLS cert on *.coolestprojects.localhost, same as the host
# browser does after installing pki/ca.crt manually (see .devcontainer/certs/README.md).
# Done here rather than in the Dockerfile: the repo (and its certs/) is only
# available via the runtime bind mount, not the image build context.
cp .devcontainer/certs/pki/ca.crt /usr/local/share/ca-certificates/coolestprojects-dev-ca.crt
update-ca-certificates

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