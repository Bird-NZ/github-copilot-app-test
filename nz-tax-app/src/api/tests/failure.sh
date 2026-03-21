#!/usr/bin/env bash
set -euo pipefail
BASE="http://127.0.0.1:8787"
node server.js >/tmp/nztaxapi.log 2>&1 &
PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT
sleep 1

code(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }

# auth required
[ "$(code "$BASE/workspaces")" = "401" ]

# signup/signin and invalid session check
curl -s -X POST "$BASE/auth/signup" -H 'content-type: application/json' -d '{"email":"fail@example.com","password":"pass123"}' >/dev/null
RESP=$(curl -s -X POST "$BASE/auth/signin" -H 'content-type: application/json' -d '{"email":"fail@example.com","password":"pass123"}')
TOKEN=$(echo "$RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')

# invalid workspace
[ "$(code -H "authorization: Bearer $TOKEN" "$BASE/workspaces/not-real")" = "404" ]

# invalid income type
WS=$(curl -s -X POST "$BASE/workspaces" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"taxYearStart":"2025-04-01","taxYearEnd":"2026-03-31"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["workspace"]["id"])')
[ "$(code -X POST "$BASE/workspaces/$WS/income/notatype" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{}')" = "400" ]

echo "FAILURE_TESTS_OK"
