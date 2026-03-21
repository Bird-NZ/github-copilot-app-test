#!/usr/bin/env bash
set -euo pipefail
BASE="http://127.0.0.1:8787"

node server.js >/tmp/nztaxapi.log 2>&1 &
PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT
sleep 1

curl -s -X POST "$BASE/auth/signup" -H 'content-type: application/json' -d '{"email":"smoke@example.com","password":"pass123"}' >/dev/null
RESP=$(curl -s -X POST "$BASE/auth/signin" -H 'content-type: application/json' -d '{"email":"smoke@example.com","password":"pass123"}')
TOKEN=$(echo "$RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
WS=$(curl -s -X POST "$BASE/workspaces" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"taxYearStart":"2025-04-01","taxYearEnd":"2026-03-31"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["workspace"]["id"])')

# questionnaire
curl -s "$BASE/questionnaire/schema" -H "authorization: Bearer $TOKEN" >/dev/null
curl -s -X POST "$BASE/questionnaire/evaluate" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"answers":{"has_crypto":true}}' >/dev/null

# doc upload + checklist
curl -s -X POST "$BASE/workspaces/$WS/documents" -H "authorization: Bearer $TOKEN" -F "docType=crypto_csv" -F "file=@/etc/hosts" >/dev/null
curl -s "$BASE/workspaces/$WS/checklist" -H "authorization: Bearer $TOKEN" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert any(x["docType"]=="crypto_csv" and x["status"]=="received" for x in d["checklist"])'

# income + crypto
curl -s -X POST "$BASE/workspaces/$WS/income/paye" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"gross":100000,"payeWithheld":30000}' >/dev/null
CSV='date,asset,type,amount,price_nzd,fee_nzd,exchange\n2025-06-01,BTC,buy,0.01,100000,15,Binance'
curl -s -X POST "$BASE/workspaces/$WS/crypto/import-csv" -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d "{\"csv\":\"$CSV\"}" >/dev/null

# ir3 map/calc/export/audit
curl -s "$BASE/workspaces/$WS/ir3/map" -H "authorization: Bearer $TOKEN" >/dev/null
curl -s "$BASE/workspaces/$WS/ir3/calc" -H "authorization: Bearer $TOKEN" >/dev/null
curl -s "$BASE/workspaces/$WS/export/draft" -H "authorization: Bearer $TOKEN" >/dev/null
curl -s "$BASE/workspaces/$WS/audit" -H "authorization: Bearer $TOKEN" >/dev/null

echo "SMOKE_OK"
