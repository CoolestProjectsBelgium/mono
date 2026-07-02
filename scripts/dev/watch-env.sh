#!/usr/bin/env bash
# File watchers on Docker bind mounts (especially Windows hosts) miss saves without polling.
export CHOKIDAR_USEPOLLING="${CHOKIDAR_USEPOLLING:-true}"
export CHOKIDAR_INTERVAL="${CHOKIDAR_INTERVAL:-1000}"
export WATCHPACK_POLLING="${WATCHPACK_POLLING:-true}"

# Dev blob upload (matches .devcontainer/docker-compose.yml; used when API is restarted via scripts).
export AZURE_BLOB_PUBLIC_BASE_URL="${AZURE_BLOB_PUBLIC_BASE_URL:-https://registration.coolestprojects.localhost:8443/_blob}"
export URL="${URL:-https://registration.coolestprojects.localhost:8443}"
