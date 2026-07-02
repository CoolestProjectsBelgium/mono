#!/usr/bin/env bash
# File watchers on Docker bind mounts (especially Windows hosts) miss saves without polling.
export CHOKIDAR_USEPOLLING="${CHOKIDAR_USEPOLLING:-true}"
export CHOKIDAR_INTERVAL="${CHOKIDAR_INTERVAL:-1000}"
export WATCHPACK_POLLING="${WATCHPACK_POLLING:-true}"
