#!/usr/bin/env bash
# Stop whichever process is listening on a TCP port (Linux devcontainer).
port="$1"
if [ -z "$port" ]; then
  echo "usage: stop-port.sh <port>" >&2
  exit 1
fi
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${port}/tcp" 2>/dev/null || true
fi
case "$port" in
  3004)
    pkill -f 'nuxi.mjs dev' 2>/dev/null || true
    pkill -f 'nuxt dev' 2>/dev/null || true
    pkill -f '@nuxt/cli' 2>/dev/null || true
    ;;
  3001)
    pkill -f 'nest start --watch' 2>/dev/null || true
    pkill -f 'apps/api/dist/main' 2>/dev/null || true
    ;;
esac
