#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

. "$ROOT/scripts/dev/watch-env.sh"

npm i -g @nestjs/cli

# Avoid stale processes from a previous start (common after manual restarts).
for port in 3000 3001 3002 3003 3004 3005; do
  bash "$ROOT/scripts/dev/stop-port.sh" "$port"
done
sleep 1

# build database package (API imports compiled dist)
npm run build --workspace=@coolestprojects/database

# build the api cli (seed-db runs dist/cli)
npm run build --workspace=apps/api

# load test db
npm run seed-db --workspace=apps/api

# Keep database models compiling in the background when they change.
nohup npm run build:watch --workspace=@coolestprojects/database > /tmp/database-watch.log 2>&1 &

# Start Admin app
npm run start:dev --workspace=apps/admin &

# Start API backend
npm run start:dev --workspace=apps/api &

# Start Static apps
npm run start:dev --workspace=apps/eventguide -- -p 3002 &
npm run start:dev --workspace=apps/presentation -- -p 3003 &
npm run dev --workspace=apps/registration -- --port 3004 --host 0.0.0.0 &
npm run start:dev --workspace=apps/voting -- -p 3005 &

# Keep container running
wait
