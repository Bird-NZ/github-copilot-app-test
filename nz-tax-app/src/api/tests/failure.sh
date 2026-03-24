#!/usr/bin/env bash
set -euo pipefail
BASE="http://127.0.0.1:8787"
AUTH_MODE=none node server.js >/tmp/nztaxapi.log 2>&1 &
PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT
sleep 1

code(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }

# session is available without token in no-auth mode
[ "$(code "$BASE/auth/session")" = "200" ]

# invalid workspace
[ "$(code "$BASE/workspaces/not-real")" = "404" ]

# create workspace for error-path tests
WS=$(curl -s -X POST "$BASE/workspaces" -H 'content-type: application/json' -d '{"taxYearStart":"2025-04-01","taxYearEnd":"2026-03-31"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["workspace"]["id"])')

# invalid income type
[ "$(code -X POST "$BASE/workspaces/$WS/income/notatype" -H 'content-type: application/json' -d '{}')" = "400" ]

# missing csv payload
[ "$(code -X POST "$BASE/workspaces/$WS/crypto/import-csv" -H 'content-type: application/json' -d '{}')" = "400" ]

# missing file upload
[ "$(code -X POST "$BASE/workspaces/$WS/documents" -F "docType=other")" = "400" ]

echo "FAILURE_TESTS_OK"
