#!/usr/bin/env bash
# Rebuild and restart the NestJS API on port 3001 (devcontainer).
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

. "$ROOT/scripts/dev/watch-env.sh"

bash "$ROOT/scripts/dev/stop-port.sh" 3001
pkill -f 'nest start --watch' 2>/dev/null || true
pkill -f 'apps/api/dist/main' 2>/dev/null || true
sleep 1

npm run build --workspace=@coolestprojects/database
npm run build --workspace=@coolestprojects/api

nohup npm run start:dev --workspace=@coolestprojects/api > /tmp/api.log 2>&1 &

for _ in $(seq 1 60); do
  if grep -q 'Nest application successfully started' /tmp/api.log 2>/dev/null \
    && ! grep -q 'EADDRINUSE' /tmp/api.log 2>/dev/null; then
    echo "API reloaded on http://127.0.0.1:3001 (log: /tmp/api.log)"
    exit 0
  fi
  sleep 2
done

echo "API failed to start; see /tmp/api.log" >&2
tail -30 /tmp/api.log >&2
exit 1
