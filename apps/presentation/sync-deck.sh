#!/usr/bin/env bash
#
# Syncs the presentation slide deck from the API onto local disk for a
# venue display (e.g. a Raspberry Pi). Delta-mode: a single cheap list
# call decides what changed (each slide's hash, plus a deck-level rollup
# hash), and only slides whose hash actually changed are re-downloaded.
# Resilient to a flaky/offline connection: every HTTP call retries with
# backoff, and a failed sync pass just waits for the next poll instead
# of crashing the service.
#
# Usage:
#   PRESENTATION_API_URL=https://api.example.com/presentation \
#   PRESENTATION_USER=presentation \
#   PRESENTATION_PASSWORD=secret \
#   ./sync-deck.sh                 # runs forever, polling every POLL_INTERVAL_SECONDS
#
#   ./sync-deck.sh --once          # one sync pass, for cron/systemd-timer use instead
#
# Config (env vars):
#   PRESENTATION_API_URL       required — e.g. https://api.coolestprojects.example/presentation
#   PRESENTATION_USER          required — HTTP Basic auth (the 'presentation'-type Account)
#   PRESENTATION_PASSWORD      required
#   OUTPUT_DIR                 optional — where slide images + manifest.json land (default: ./deck next to this script)
#   POLL_INTERVAL_SECONDS      optional — seconds between passes in loop mode (default: 60)
#
# Display-client hand-off (all optional — skip these entirely if nothing
# reads SLIDE_LIST_FILE or ON_DECK_CHANGED_CMD). Consumed by slideshow.sh,
# which dispatches to either feh-slideshow.sh or imv-slideshow.sh — see
# those scripts, not feh/imv specifically, for what reads these:
#   SLIDE_LIST_FILE            optional — path to write an ordered, one-path-per-line filelist
#                              after each pass that actually changed something. Plain directory
#                              listing/sort can't reproduce the deck's real order (slide keys
#                              don't sort that way), so this is written explicitly in the API's
#                              own order. Format matches feh(1)'s `-f`/`--filelist`; imv has no
#                              equivalent flag, so imv-slideshow.sh reads this file itself instead.
#   SLIDE_TICK_SECONDS         optional — the fixed slideshow delay (seconds) you'll pair with
#                              SLIDE_LIST_FILE (default: 1) — feh's `-D` / imv's `-t`, both only
#                              support one global delay, so each slide's own `time` is approximated
#                              by repeating its path round(time / tick) times in the filelist —
#                              redisplaying the same file back-to-back is an effectively invisible
#                              "reload".
#   ON_DECK_CHANGED_CMD        optional — shell command run after a pass that changed the deck
#                              (new/updated/removed slides, or just reordering) and finished
#                              writing SLIDE_LIST_FILE — e.g. a command that (re)launches the
#                              display client, since neither feh nor imv notices a changed
#                              filelist on its own. See slideshow.sh.
#
# Requires: curl, jq

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-${SCRIPT_DIR}/deck}"
POLL_INTERVAL_SECONDS="${POLL_INTERVAL_SECONDS:-60}"
MANIFEST_FILE="${OUTPUT_DIR}/manifest.json"
TMP_DIR="${OUTPUT_DIR}/.tmp"

SLIDE_LIST_FILE="${SLIDE_LIST_FILE:-}"
SLIDE_TICK_SECONDS="${SLIDE_TICK_SECONDS:-1}"
ON_DECK_CHANGED_CMD="${ON_DECK_CHANGED_CMD:-}"

# curl retry flags cover a single request's transient failures (dropped
# connection, timeout, 5xx); the outer loop (run_loop) is what carries the
# device through a longer outage — it just tries the whole pass again next
# poll instead of giving up. --retry-all-errors needs curl >= 7.71 (ships
# on any current Raspberry Pi OS); drop it on older images if needed.
CURL_OPTS=(
  --silent --show-error --fail
  --connect-timeout 10 --max-time 30
  --retry 5 --retry-delay 2 --retry-max-time 60 --retry-all-errors
)

log() {
  printf '%s [presentation-sync] %s\n' "$(date -Iseconds)" "$1" >&2
}

require_env() {
  local missing=()
  [[ -z "${PRESENTATION_API_URL:-}" ]] && missing+=(PRESENTATION_API_URL)
  [[ -z "${PRESENTATION_USER:-}" ]] && missing+=(PRESENTATION_USER)
  [[ -z "${PRESENTATION_PASSWORD:-}" ]] && missing+=(PRESENTATION_PASSWORD)
  if (( ${#missing[@]} > 0 )); then
    log "Missing required environment variable(s): ${missing[*]}"
    exit 1
  fi

  if [[ -n "$SLIDE_LIST_FILE" ]] && ! [[ "$SLIDE_TICK_SECONDS" =~ ^[1-9][0-9]*$ ]]; then
    log "SLIDE_TICK_SECONDS must be a positive integer (got '${SLIDE_TICK_SECONDS}')"
    exit 1
  fi
}

require_tools() {
  local missing=()
  command -v curl >/dev/null 2>&1 || missing+=(curl)
  command -v jq >/dev/null 2>&1 || missing+=(jq)
  if (( ${#missing[@]} > 0 )); then
    log "Missing required tool(s): ${missing[*]} — install with 'sudo apt install ${missing[*]}'"
    exit 1
  fi
}

api_get() {
  # $1 = path relative to PRESENTATION_API_URL (may be empty for the list
  # endpoint itself), written to stdout
  local path="$1"
  local url="${PRESENTATION_API_URL%/}"
  [[ -n "$path" ]] && url="${url}/${path}"
  curl "${CURL_OPTS[@]}" --user "${PRESENTATION_USER}:${PRESENTATION_PASSWORD}" "$url"
}

# Slide keys are already filesystem-safe (`slide-<id>` / `slide-<id>-<id>`)
# but the manifest comes from the network, so sanitize defensively before
# ever using a key as part of a filesystem path.
safe_filename() {
  printf '%s' "$1" | tr -cd 'A-Za-z0-9_-'
}

# Writes an ordered filelist (one absolute image path per line, format
# matches feh(1)'s `-f`/`--filelist` — imv-slideshow.sh reads the same file
# itself instead, since imv has no equivalent flag), in the deck's real
# order (taken straight from the API's own array order —
# `PresentationService.listSlides` already sorts by each slide's `order`
# column, so no re-sorting needed here). Each path is repeated
# round(time / SLIDE_TICK_SECONDS) times so a fixed slideshow delay
# (feh's `-D`, imv's `-t`) approximates that slide's own `time` — neither
# tool has a per-image duration, so this is the least invasive way to get
# one back without a separate controller process.
write_slide_list() {
  local list_json="$1"
  local tmp_list="${TMP_DIR}/slide-list.txt.tmp"
  : > "$tmp_list"

  while IFS=$'\t' read -r key slide_time; do
    local file="${OUTPUT_DIR}/$(safe_filename "$key").png"
    local reps=$(( (slide_time + SLIDE_TICK_SECONDS / 2) / SLIDE_TICK_SECONDS ))
    (( reps < 1 )) && reps=1
    for ((i = 0; i < reps; i++)); do
      printf '%s\n' "$file" >> "$tmp_list"
    done
  done < <(jq -r '.slides[] | [.key, .time] | @tsv' <<<"$list_json")

  mv -f "$tmp_list" "$SLIDE_LIST_FILE"
}

sync_once() {
  mkdir -p "$OUTPUT_DIR" "$TMP_DIR"

  local list_json
  if ! list_json=$(api_get ""); then
    log "Could not reach the presentation API (offline or unreachable) — will retry next pass"
    return 1
  fi

  local deck_hash
  deck_hash=$(jq -r '.hash' <<<"$list_json")

  local previous_deck_hash=""
  if [[ -f "$MANIFEST_FILE" ]]; then
    previous_deck_hash=$(jq -r '.deckHash // ""' "$MANIFEST_FILE" 2>/dev/null || echo "")
  fi

  if [[ -n "$deck_hash" && "$deck_hash" == "$previous_deck_hash" ]]; then
    log "Deck unchanged (hash ${deck_hash}) — nothing to sync"
    return 0
  fi

  local updated=0 skipped=0 failed=0
  local new_files=()

  while IFS=$'\t' read -r key hash; do
    local file="$(safe_filename "$key").png"
    new_files+=("$file")

    local previous_hash=""
    if [[ -f "$MANIFEST_FILE" ]]; then
      previous_hash=$(jq -r --arg key "$key" '.slides[]? | select(.key == $key) | .hash // ""' "$MANIFEST_FILE" 2>/dev/null || echo "")
    fi

    if [[ "$hash" == "$previous_hash" && -f "${OUTPUT_DIR}/${file}" ]]; then
      skipped=$((skipped + 1))
      continue
    fi

    local tmp_file="${TMP_DIR}/${file}.download"
    if api_get "$(safe_filename "$key")" > "$tmp_file"; then
      mv -f "$tmp_file" "${OUTPUT_DIR}/${file}"
      updated=$((updated + 1))
      log "Synced ${key} (hash ${hash})"
    else
      rm -f "$tmp_file"
      failed=$((failed + 1))
      log "Failed to download slide ${key} — will retry next pass"
    fi
  done < <(jq -r '.slides[] | [.key, .hash] | @tsv' <<<"$list_json")

  # Only prune files that belonged to a slide the manifest previously
  # tracked and that is no longer in the deck — never a blind wildcard
  # delete, so anything an operator dropped in this folder is left alone.
  local removed=0
  if [[ -f "$MANIFEST_FILE" ]]; then
    local new_files_list=""
    if (( ${#new_files[@]} > 0 )); then
      new_files_list=$(printf '%s\n' "${new_files[@]}")
    fi
    while IFS= read -r old_file; do
      if [[ -n "$old_file" ]] && ! grep -qxF "$old_file" <<<"$new_files_list"; then
        rm -f "${OUTPUT_DIR}/${old_file}"
        removed=$((removed + 1))
      fi
    done < <(jq -r '.slides[]? | (.key | gsub("[^A-Za-z0-9_-]"; "")) + ".png"' "$MANIFEST_FILE" 2>/dev/null || true)
  fi

  if (( failed > 0 )); then
    log "Sync pass incomplete: ${updated} updated, ${skipped} unchanged, ${failed} failed, ${removed} removed"
    return 1
  fi

  # Written last and atomically: the manifest is the source of truth for
  # "what's currently on disk", so it must never point at a slide whose
  # download didn't actually succeed.
  jq -n --arg deckHash "$deck_hash" --arg syncedAt "$(date -Iseconds)" --argjson slides "$(jq '.slides' <<<"$list_json")" \
    '{deckHash: $deckHash, syncedAt: $syncedAt, slides: $slides}' > "${MANIFEST_FILE}.tmp"
  mv -f "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"

  log "Sync pass complete: ${updated} updated, ${skipped} unchanged, ${removed} removed"

  # Reaching here means the rollup hash differed from last time (the
  # early-return above caught the truly-unchanged case) — so even a pass
  # with 0 downloads (e.g. just a reorder) still needs a fresh slide list.
  if [[ -n "$SLIDE_LIST_FILE" ]]; then
    write_slide_list "$list_json"
  fi

  if [[ -n "$ON_DECK_CHANGED_CMD" ]]; then
    log "Deck changed — running ON_DECK_CHANGED_CMD"
    if bash -c "$ON_DECK_CHANGED_CMD"; then
      :
    else
      local hook_status=$?
      log "ON_DECK_CHANGED_CMD failed (exit ${hook_status}) — deck is still synced to disk, will try the hook again next change"
    fi
  fi

  return 0
}

run_loop() {
  local backoff="$POLL_INTERVAL_SECONDS"
  local max_backoff=$(( POLL_INTERVAL_SECONDS * 10 ))

  while true; do
    if sync_once; then
      backoff="$POLL_INTERVAL_SECONDS"
    else
      backoff=$(( backoff * 2 ))
      (( backoff > max_backoff )) && backoff=$max_backoff
      log "Backing off for ${backoff}s after a failed pass"
    fi
    sleep "$backoff"
  done
}

main() {
  require_tools
  require_env

  if [[ "${1:-}" == "--once" ]]; then
    sync_once
    exit $?
  fi

  run_loop
}

main "$@"
