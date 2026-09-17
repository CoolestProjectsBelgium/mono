#!/usr/bin/env bash
#
# Auto-detects the running desktop session and dispatches to
# imv-slideshow.sh (native Wayland) or feh-slideshow.sh (X11) — the single
# ON_DECK_CHANGED_CMD entry point to use across a fleet of mixed-generation
# Pis, since which client applies depends on what's actually running on THIS
# device, not just its hardware generation:
#   - Newer Pis (4/5) on Raspberry Pi OS Bookworm default to the Wayland
#     (labwc) session -> imv-slideshow.sh.
#   - Older Pis (Zero/Zero W/1/2/3), or any Pi still on Bullseye/Buster, or a
#     Bookworm Pi an operator switched back to the X11 session (per
#     feh-slideshow.sh's own note, e.g. because it can't drive labwc well)
#     only have X11 -> feh-slideshow.sh.
# Detected from the actual session env vars (WAYLAND_DISPLAY / DISPLAY), not
# the Pi model or OS version — that's what's actually true right now on this
# specific device, regardless of *why* (hardware limit, older OS image, or
# an admin's own choice to run X11 on newer hardware too). If a Wayland
# session with XWayland active happens to have both set, native Wayland
# (imv) is preferred over the XWayland translation layer.
#
# Set SLIDESHOW_CLIENT=imv or SLIDESHOW_CLIENT=feh to force a specific
# client instead of auto-detecting — useful when debugging one Pi, or if a
# device's env vars don't reflect reality for some reason.
#
# Usage: identical to feh-slideshow.sh / imv-slideshow.sh — same env vars
# (SLIDE_LIST_FILE, SLIDE_TICK_SECONDS, ...), just point ON_DECK_CHANGED_CMD (or
# .xinitrc/labwc autostart) at this script instead of one of the two
# directly. Safe as the one script every device in a mixed fleet uses,
# rather than having to remember per-device which one to configure.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SLIDESHOW_CLIENT="${SLIDESHOW_CLIENT:-}"

log() {
  printf '%s [slideshow] %s\n' "$(date -Iseconds)" "$1" >&2
}

use_imv() {
  if ! command -v imv-wayland >/dev/null 2>&1; then
    log "SLIDESHOW_CLIENT=imv (or Wayland session detected) but imv-wayland isn't installed — 'sudo apt install imv'"
    exit 1
  fi
  exec "${SCRIPT_DIR}/imv-slideshow.sh"
}

use_feh() {
  if ! command -v feh >/dev/null 2>&1; then
    log "SLIDESHOW_CLIENT=feh (or X11 session detected) but feh isn't installed — 'sudo apt install feh'"
    exit 1
  fi
  exec "${SCRIPT_DIR}/feh-slideshow.sh"
}

case "$SLIDESHOW_CLIENT" in
  imv)
    log "SLIDESHOW_CLIENT=imv — using imv"
    use_imv
    ;;
  feh)
    log "SLIDESHOW_CLIENT=feh — using feh"
    use_feh
    ;;
  "")
    ;;
  *)
    log "Unknown SLIDESHOW_CLIENT '${SLIDESHOW_CLIENT}' (expected 'imv' or 'feh')"
    exit 1
    ;;
esac

if [[ -n "${WAYLAND_DISPLAY:-}" ]]; then
  log "Wayland session detected (WAYLAND_DISPLAY=${WAYLAND_DISPLAY}) — using imv"
  use_imv
fi

if [[ -n "${DISPLAY:-}" ]]; then
  log "X11 session detected (DISPLAY=${DISPLAY}) — using feh"
  use_feh
fi

log "Neither WAYLAND_DISPLAY nor DISPLAY is set — no graphical session reachable from here (see presentation-sync.env.example's note on headless services)"
exit 1
