#!/usr/bin/env bash
set -euo pipefail

echo "==> Stopping app processes"
for PORT in 3000 3001 3002 3003 3004 3005 3006 3007; do
  fuser -k "${PORT}/tcp" 2>/dev/null || true
done

pkill -9 -f "nuxt dev" 2>/dev/null || true
pkill -9 -f "nest start" 2>/dev/null || true
pkill -9 -f "apps/api/dist/main" 2>/dev/null || true
pkill -9 -f "node dist/main.js" 2>/dev/null || true
pkill -9 -f "tsx watch" 2>/dev/null || true
sleep 4

cd /workspace

echo "==> Building packages/database"
npm run build --workspace=packages/database

echo "==> Building apps/api"
npm run build --workspace=apps/api

echo "==> Clearing registration .nuxt cache"
rm -rf apps/registration/.nuxt

echo "==> Starting API (built dist)"
nohup node apps/api/dist/main.js > /tmp/api.log 2>&1 &

echo "==> Waiting for API on :3001"
for _ in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/settings || true)
  if [ "$code" = "200" ]; then
    break
  fi
  sleep 2
done

echo "==> Starting frontends"
nohup npm run start:dev --workspace=apps/admin > /tmp/admin.log 2>&1 &
nohup npm run start:dev --workspace=apps/eventguide -- -p 3002 > /tmp/eventguide.log 2>&1 &
nohup npm run start:dev --workspace=apps/presentation -- -p 3003 > /tmp/presentation.log 2>&1 &
nohup npm run start:dev --workspace=apps/registration > /tmp/registration.log 2>&1 &
nohup npm run start:dev --workspace=apps/voting -- -p 3005 > /tmp/voting.log 2>&1 &

sleep 30

echo "==> Verifying auth cookies (direct API)"
node apps/registration/scripts/verify-auth-cookie.mjs

echo "==> Verifying auth cookies (proxy headers)"
SMOKE_API_BASE=http://127.0.0.1:3001 node apps/registration/scripts/auth-cross-origin-smoke.mjs

echo "==> Health checks"
for PORT in 3000 3001 3002 3003 3004 3005; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/" || echo '000')
  echo "  ${PORT}: ${CODE}"
done

echo "==> Done"
