#!/usr/bin/env bash

for PORT in 3000 3001 3002 3003 3004 3005 3006 3007; do
  fuser -k "${PORT}/tcp" 2>/dev/null || true
done

pkill -9 -f "nuxt dev" 2>/dev/null || true
pkill -9 -f "nest start" 2>/dev/null || true
pkill -9 -f "apps/api/dist/main" 2>/dev/null || true
sleep 4

cd /workspace

nohup npm run start:dev --workspace=apps/api > /tmp/api.log 2>&1 &
# Wait until API owns 3001 before starting other apps (registration also defaults near 3001).
for _ in $(seq 1 40); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/settings || true)
  if [ "$code" = "200" ]; then
    break
  fi
  sleep 2
done

nohup npm run start:dev --workspace=apps/admin > /tmp/admin.log 2>&1 &
nohup npm run start:dev --workspace=apps/eventguide -- -p 3002 > /tmp/eventguide.log 2>&1 &
nohup npm run start:dev --workspace=apps/presentation -- -p 3003 > /tmp/presentation.log 2>&1 &
nohup npm run start:dev --workspace=apps/registration > /tmp/registration.log 2>&1 &
nohup npm run start:dev --workspace=apps/voting -- -p 3005 > /tmp/voting.log 2>&1 &

sleep 25

echo "Health checks:"
for PORT in 3000 3001 3002 3003 3004 3005; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/" || echo '000')
  echo "  ${PORT}: ${CODE}"
done

echo "Registration:"
grep -E 'Local:|EADDRINUSE|Unable to find' /tmp/registration.log | tail -2 || true

echo "API:"
grep -E 'successfully started|EADDRINUSE' /tmp/api.log | tail -2 || true
