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
curl -s -X PUT "$BASE/workspaces/$WS/questionnaire" -H 'content-type: application/json' -d '{"answers":{"has_crypto":true}}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["answers"]["has_crypto"] is True'

# doc upload + checklist
DOC_ID=$(curl -s -X POST "$BASE/workspaces/$WS/documents" -F "docType=crypto_csv" -F "file=@/etc/hosts" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
curl -s "$BASE/workspaces/$WS/checklist" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert any(x["docType"]=="crypto_csv" and x["status"]=="received" for x in d["checklist"])'
curl -s "$BASE/workspaces/$WS/documents" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["evidenceLinkOptions"]) >= 2 and any(opt["key"]=="auto" for opt in d["evidenceLinkOptions"])'
curl -s -X PATCH "$BASE/workspaces/$WS/documents/$DOC_ID/evidence-link" -H 'content-type: application/json' -d '{"evidenceLinks":[{"mode":"manual","supports":"PAYE income","section":"Income","ir3Refs":["11B","11C"],"summaryKey":null},{"mode":"manual","supports":"Crypto transaction history","section":"Crypto","ir3Refs":["crypto"],"summaryKey":null}]}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["document"]["evidenceLinks"])==2 and {item["supports"] for item in d["document"]["evidenceLinks"]}=={"PAYE income", "Crypto transaction history"}'

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
curl -s "$BASE/workspaces/$WS/export/draft" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "csv" in d and "pdf" in d and "json" in d and d["json"]["workspace"]["id"] and d["pdf"]["mimeType"]=="application/pdf" and d["pdf"]["bytesBase64"] and d["review"]["crypto"]["intro"] and any(item["activity"].startswith("Selling crypto") for item in d["review"]["crypto"]["taxableActivities"])'
curl -s "$BASE/workspaces/$WS/review" | python3 -c 'import sys,json; d=json.load(sys.stdin); review=d["review"]; supports={(item["supports"], tuple(item["ir3Refs"])) for item in review["evidence"] if item["documentType"] == "crypto_csv"}; crypto_warning=next((warning for warning in review["warnings"] if warning["code"]=="CRYPTO_EVIDENCE_MISSING"), None); assert review["crypto"]["status"]["hasCryptoCsv"] is True and review["crypto"]["transactionCounts"]["buy"] == 1 and "NZD value" in " ".join(review["crypto"]["whatToProvide"]) and ("PAYE income", ("11B", "11C")) in supports and ("Crypto transaction history", ("crypto",)) in supports and crypto_warning is None'
curl -s "$BASE/workspaces/$WS/audit" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["events"]) >= 5 and d["events"][0]["label"] and d["events"][0]["category"] and d["summary"]["totalEvents"] >= 5 and "crypto" in d["availableCategories"]'
curl -s "$BASE/workspaces/$WS/audit?category=crypto" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["events"]) == 1 and d["events"][0]["action"]=="crypto.import_csv" and d["events"][0]["details"]=="1 transaction imported"'
curl -s "$BASE/workspaces/$WS/audit?q=PAYE" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert any(event["label"]=="PAYE added" for event in d["events"])'

echo "SMOKE_OK"
