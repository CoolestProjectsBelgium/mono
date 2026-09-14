#!/usr/bin/env bash
#
# (Re)launches imv (native Wayland, not XWayland) as a fullscreen kiosk
# slideshow reading the ordered filelist sync-deck.sh writes
# (SLIDE_LIST_FILE). Alternative to feh-slideshow.sh for a Raspberry Pi OS
# Bookworm default desktop session (Wayland/labwc) — feh needs X11 (see
# feh-slideshow.sh's own header) and this avoids running it under XWayland.
# Same hand-off contract as feh-slideshow.sh, so it's a drop-in swap: point
# sync-deck.sh's ON_DECK_CHANGED_CMD at this script instead, nothing else
# changes. Meant to be used two ways:
#   1. As sync-deck.sh's ON_DECK_CHANGED_CMD, so imv restarts whenever the
#      deck actually changes (imv has no way to notice a changed filelist on
#      its own — restarting it is the reliable option, same reasoning as
#      feh-slideshow.sh; imv does have a live IPC socket (see imv-msg(1))
#      that could push an updated `open`/`close all` without a restart, but
#      that's a bigger behavior change than this first cut aims for).
#   2. Run once on its own at session start (e.g. from labwc's autostart) to
#      get the very first imv instance up before any deck change fires.
#
# Why imv-wayland specifically, not plain `imv`: Debian's imv package ships
# imv-wayland and imv-x11 as separate binaries and deliberately does not
# install upstream's auto-detecting `imv` wrapper (name clash with the
# renameutils package — see /usr/share/doc/imv/README.Debian on the device).
# Calling imv-wayland directly is what actually guarantees native Wayland
# rather than silently falling back to XWayland.
#
# No SLIDE_LIST_FILE support built into imv (unlike feh's --filelist <file>):
# imv only takes paths as positional arguments. This script reads the same
# filelist sync-deck.sh writes and expands it onto imv-wayland's argv — the
# same per-slide-duration-via-repeated-path trick sync-deck.sh's
# write_slide_list() already does for feh works here too, since imv just
# walks its list of paths at a fixed slideshow interval the same way.
#
# Not handled here (compositor-specific, no portable client-side equivalent
# to X11's xset used in feh-slideshow.sh):
#   - Disabling screen blanking/DPMS — configure in labwc's rc.xml
#     (<screensaver> / idle settings) or whatever compositor you're running.
#   - Hiding the idle pointer — most Wayland compositors (including labwc)
#     already do this on their own after inactivity; imv has no
#     --hide-pointer equivalent to set from here.
#
# Config (env vars):
#   SLIDE_LIST_FILE     required — same path sync-deck.sh's SLIDE_LIST_FILE writes to
#                        (shared name with feh-slideshow.sh — same filelist,
#                        same format, so this is a drop-in alternative)
#   SLIDE_TICK_SECONDS  optional — must match sync-deck.sh's SLIDE_TICK_SECONDS (default: 1)
#   IMV_PID_FILE        optional — where the running imv's pid is tracked (default: /tmp/presentation-imv.pid)
#   WAYLAND_DISPLAY      optional — Wayland display socket name (default: wayland-0)
#   XDG_RUNTIME_DIR      optional — required by Wayland/imv's IPC socket; left as whatever
#                        the calling session already has, not defaulted here
#
# Requires: imv (Debian/Raspberry Pi OS: imv-wayland from the imv package)

set -euo pipefail

: "${SLIDE_LIST_FILE:?SLIDE_LIST_FILE must be set to the filelist sync-deck.sh writes}"
SLIDE_TICK_SECONDS="${SLIDE_TICK_SECONDS:-1}"
IMV_PID_FILE="${IMV_PID_FILE:-/tmp/presentation-imv.pid}"
export WAYLAND_DISPLAY="${WAYLAND_DISPLAY:-wayland-0}"

log() {
  printf '%s [imv-slideshow] %s\n' "$(date -Iseconds)" "$1" >&2
}

if ! command -v imv-wayland >/dev/null 2>&1; then
  log "imv-wayland is not installed — install with 'sudo apt install imv'"
  exit 1
fi

if [[ ! -s "$SLIDE_LIST_FILE" ]]; then
  log "SLIDE_LIST_FILE (${SLIDE_LIST_FILE}) is missing or empty — nothing to show yet"
  exit 1
fi

if [[ -f "$IMV_PID_FILE" ]]; then
  old_pid="$(cat "$IMV_PID_FILE" 2>/dev/null || true)"
  if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
    log "Stopping previous imv instance (pid ${old_pid})"
    kill "$old_pid" 2>/dev/null || true
    # Not a child of this process (it was backgrounded by an earlier,
    # already-exited invocation of this script), so `wait` won't work —
    # give it a brief moment to actually exit before starting the new one.
    sleep 0.3
  fi
fi

# imv takes paths as positional args, not a --filelist file — read
# SLIDE_LIST_FILE (one path per line, already in deck order, already
# repeated per-slide to approximate duration at a fixed tick) into an array.
mapfile -t slide_files < "$SLIDE_LIST_FILE"

log "Starting imv-wayland (tick ${SLIDE_TICK_SECONDS}s, ${#slide_files[@]} entries from ${SLIDE_LIST_FILE})"
imv-wayland -f -s full -t "$SLIDE_TICK_SECONDS" \
  "${slide_files[@]}" \
  >/tmp/presentation-imv.log 2>&1 &

echo $! > "$IMV_PID_FILE"
disown
