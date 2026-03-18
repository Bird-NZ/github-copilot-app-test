#!/usr/bin/env bash
set -euo pipefail

# Resilient log watcher for OpenClaw.
# - Tries RPC logs first (`openclaw logs --follow --plain`)
# - If gateway closes, falls back to file tail and retries automatically

LOG_DIR="/tmp/openclaw"
SLEEP_SECS=2

current_log_file() {
  local today
  today="$(date +%F)"
  echo "${LOG_DIR}/openclaw-${today}.log"
}

ensure_gateway() {
  if ! openclaw gateway status >/dev/null 2>&1; then
    echo "[watch-openclaw-logs] gateway not healthy; attempting restart..." >&2
    openclaw gateway restart >/dev/null 2>&1 || true
    sleep 2
  fi
}

follow_file_fallback() {
  local f
  f="$(current_log_file)"
  if [[ ! -f "$f" ]]; then
    mkdir -p "$LOG_DIR"
    touch "$f"
  fi
  echo "[watch-openclaw-logs] fallback file tail: $f" >&2
  tail -n 200 -F "$f"
}

while true; do
  ensure_gateway

  echo "[watch-openclaw-logs] trying RPC stream..." >&2
  if openclaw logs --follow --plain; then
    # Normal exit is unusual for --follow; retry to keep watch alive.
    echo "[watch-openclaw-logs] RPC stream exited; retrying..." >&2
    sleep "$SLEEP_SECS"
    continue
  fi

  echo "[watch-openclaw-logs] RPC stream failed; switching to fallback..." >&2
  # Run fallback in foreground until interrupted; if it exits, retry RPC.
  follow_file_fallback || true
  sleep "$SLEEP_SECS"
done
