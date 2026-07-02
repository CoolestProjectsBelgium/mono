#!/usr/bin/env bash
# Restart the Nuxt registration dev server on port 3004 (devcontainer).
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

. "$ROOT/scripts/dev/watch-env.sh"

bash "$ROOT/scripts/dev/stop-port.sh" 3004
pkill -f 'nuxi.mjs dev' 2>/dev/null || true
pkill -f 'nuxt dev' 2>/dev/null || true
pkill -f '@nuxt/cli' 2>/dev/null || true
sleep 2

nohup npm run dev --workspace=@coolestprojects/registration -- --port 3004 --host 0.0.0.0 \
  > /tmp/registration.log 2>&1 &

for _ in $(seq 1 60); do
  if grep -qiE 'Local:|ready in' /tmp/registration.log 2>/dev/null; then
    echo "Registration reloaded on http://127.0.0.1:3004 (log: /tmp/registration.log)"
    exit 0
  fi
  sleep 2
done

echo "Registration failed to start; see /tmp/registration.log" >&2
tail -30 /tmp/registration.log >&2
exit 1
