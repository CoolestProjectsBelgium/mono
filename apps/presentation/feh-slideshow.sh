#!/usr/bin/env bash
#
# (Re)launches feh as a fullscreen kiosk slideshow reading the ordered
# filelist sync-deck.sh writes (FEH_LIST_FILE). Meant to be used two ways:
#   1. As sync-deck.sh's ON_DECK_CHANGED_CMD, so feh restarts whenever the
#      deck actually changes (feh has no way to notice a changed filelist
#      on its own — restarting it is the reliable option).
#   2. Run once on its own at session start (e.g. from .xinitrc/autostart)
#      to get the very first feh instance up before any deck change fires.
#
# feh needs a real X11 display — Raspberry Pi OS Bookworm's default
# desktop session is Wayland (labwc), where this script (and feh itself)
# won't work unmodified. Either switch the Pi to the X11 desktop session
# (raspi-config -> Advanced Options -> Wayland -> X11), or run this under
# XWayland if your setup provides one. There's no systemd *system* service
# here on purpose: feh needs a logged-in graphical session (DISPLAY +
# Xauthority), which a plain system service doesn't have — launch this
# from .xinitrc, an autostart entry, or a systemd --user unit tied to the
# graphical session instead.
#
# Config (env vars):
#   FEH_LIST_FILE       required — same path sync-deck.sh's FEH_LIST_FILE writes to
#   FEH_TICK_SECONDS    optional — must match sync-deck.sh's FEH_TICK_SECONDS (default: 1)
#   FEH_PID_FILE        optional — where the running feh's pid is tracked (default: /tmp/presentation-feh.pid)
#   DISPLAY             optional — X display to use (default: :0)
#
# Requires: feh, and (best-effort, optional) xset

set -euo pipefail

: "${FEH_LIST_FILE:?FEH_LIST_FILE must be set to the filelist sync-deck.sh writes}"
FEH_TICK_SECONDS="${FEH_TICK_SECONDS:-1}"
FEH_PID_FILE="${FEH_PID_FILE:-/tmp/presentation-feh.pid}"
export DISPLAY="${DISPLAY:-:0}"

log() {
  printf '%s [feh-slideshow] %s\n' "$(date -Iseconds)" "$1" >&2
}

if ! command -v feh >/dev/null 2>&1; then
  log "feh is not installed — install with 'sudo apt install feh'"
  exit 1
fi

if [[ ! -s "$FEH_LIST_FILE" ]]; then
  log "FEH_LIST_FILE (${FEH_LIST_FILE}) is missing or empty — nothing to show yet"
  exit 1
fi

# Best-effort kiosk niceties: don't let the display sleep/blank. Harmless
# no-op if xset isn't installed or there's no X session yet.
if command -v xset >/dev/null 2>&1; then
  xset s off >/dev/null 2>&1 || true
  xset -dpms >/dev/null 2>&1 || true
  xset s noblank >/dev/null 2>&1 || true
fi

if [[ -f "$FEH_PID_FILE" ]]; then
  old_pid="$(cat "$FEH_PID_FILE" 2>/dev/null || true)"
  if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
    log "Stopping previous feh instance (pid ${old_pid})"
    kill "$old_pid" 2>/dev/null || true
    # Not a child of this process (it was backgrounded by an earlier,
    # already-exited invocation of this script), so `wait` won't work —
    # give it a brief moment to actually exit before starting the new one.
    sleep 0.3
  fi
fi

log "Starting feh (tick ${FEH_TICK_SECONDS}s, filelist ${FEH_LIST_FILE})"
feh --fullscreen --hide-pointer --auto-zoom --borderless \
  --slideshow-delay "$FEH_TICK_SECONDS" \
  --filelist "$FEH_LIST_FILE" \
  >/tmp/presentation-feh.log 2>&1 &

echo $! > "$FEH_PID_FILE"
disown
