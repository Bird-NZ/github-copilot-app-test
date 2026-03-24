#!/usr/bin/env bash
set -euo pipefail
BASE="http://127.0.0.1:8787"

AUTH_MODE=none node server.js >/tmp/nztaxapi.log 2>&1 &
PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT
sleep 1

WS=$(curl -s -X POST "$BASE/workspaces" -H 'content-type: application/json' -d '{"taxYearStart":"2025-04-01","taxYearEnd":"2026-03-31"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["workspace"]["id"])')

# config + demo session
curl -s "$BASE/config" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["authMode"]=="none" and d["noAuthMode"] is True'
curl -s "$BASE/auth/session" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["session"]["userId"]=="demo-user"'

# questionnaire
curl -s "$BASE/questionnaire/schema" >/dev/null
curl -s -X POST "$BASE/questionnaire/evaluate" -H 'content-type: application/json' -d '{"answers":{"has_crypto":true}}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["status"]["totalVisible"] >= 1'

# doc upload + checklist
curl -s -X POST "$BASE/workspaces/$WS/documents" -F "docType=crypto_csv" -F "file=@/etc/hosts" >/dev/null
curl -s "$BASE/workspaces/$WS/checklist" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert any(x["docType"]=="crypto_csv" and x["status"]=="received" for x in d["checklist"])'

# income + crypto
curl -s -X POST "$BASE/workspaces/$WS/income/paye" -H 'content-type: application/json' -d '{"gross":100000,"payeWithheld":30000}' >/dev/null
python3 - <<'PY' > /tmp/nztax_smoke_crypto.json
import json
csv = 'date,asset,type,amount,price_nzd,fee_nzd,exchange\n2025-06-01,BTC,buy,0.01,100000,15,Binance'
print(json.dumps({'csv': csv}))
PY
curl -s -X POST "$BASE/workspaces/$WS/crypto/import-csv" -H 'content-type: application/json' --data-binary @/tmp/nztax_smoke_crypto.json | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["imported"]==1'

# ir3 map/calc/export/audit
curl -s "$BASE/workspaces/$WS/ir3/map" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "map" in d'
curl -s "$BASE/workspaces/$WS/ir3/calc" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "calc" in d and "map" in d'
curl -s "$BASE/workspaces/$WS/export/draft" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "csv" in d and "pdf" in d'
curl -s "$BASE/workspaces/$WS/audit" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["events"]) >= 1'

echo "SMOKE_OK"
