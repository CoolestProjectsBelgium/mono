#!/usr/bin/env bash
# Rebuild workspace packages and restart API + registration with the latest code.
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

for f in "$ROOT"/scripts/dev/*.sh "$ROOT"/.devcontainer/start.sh; do
  sed -i 's/\r$//' "$f" 2>/dev/null || true
done

. "$ROOT/scripts/dev/watch-env.sh"

echo "Rebuilding shared packages..."
npm run build --workspace=@coolestprojects/database
npm run build --workspace=@coolestprojects/api

echo "Restarting dev servers..."
bash "$ROOT/scripts/dev/restart-api.sh"
bash "$ROOT/scripts/dev/restart-registration.sh"

echo "Done. Hard-refresh the browser (Ctrl+Shift+R) if UI still looks stale."
