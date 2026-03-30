#!/usr/bin/env bash
set -euo pipefail
BASE="http://127.0.0.1:8787"

AUTH_MODE=none node server.js >/tmp/nztaxapi.log 2>&1 &
PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT
sleep 2

WS=$(curl -s -X POST "$BASE/workspaces" -H 'content-type: application/json' -d '{"taxYearStart":"2025-04-01","taxYearEnd":"2026-03-31"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["workspace"]["id"])')

# config + demo session
curl -s "$BASE/config" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["authMode"]=="none" and d["noAuthMode"] is True'
curl -s "$BASE/auth/session" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["session"]["userId"]=="demo-user"'

# questionnaire
curl -s "$BASE/questionnaire/schema" >/dev/null
curl -s -X POST "$BASE/questionnaire/evaluate" -H 'content-type: application/json' -d '{"answers":{"has_crypto":true}}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["status"]["totalVisible"] >= 1'
curl -s -X PUT "$BASE/workspaces/$WS/questionnaire" -H 'content-type: application/json' -d '{"answers":{"has_crypto":true,"has_student_loan":true}}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["answers"]["has_crypto"] is True and d["answers"]["has_student_loan"] is True'

# doc upload + checklist
DOC_ID=$(curl -s -X POST "$BASE/workspaces/$WS/documents" -F "docType=crypto_csv" -F "file=@/etc/hosts" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
DONATION_DOC_ID=$(curl -s -X POST "$BASE/workspaces/$WS/documents" -F "docType=donation_receipts" -F "donationAmount=150" -F "file=@/etc/hosts" | python3 -c 'import sys,json; print(json.load(sys.stdin)["document"]["id"])')
curl -s "$BASE/workspaces/$WS/checklist" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert any(x["docType"]=="crypto_csv" and x["status"]=="received" for x in d["checklist"]) and any(x["docType"]=="donation_receipts" and x["status"]=="received" for x in d["checklist"])'
curl -s "$BASE/workspaces/$WS/documents" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["evidenceLinkOptions"]) >= 2 and any(opt["key"]=="auto" for opt in d["evidenceLinkOptions"])'
curl -s -X PATCH "$BASE/workspaces/$WS/documents/$DOC_ID/evidence-link" -H 'content-type: application/json' -d '{"evidenceLinks":[{"mode":"manual","supports":"PAYE income","section":"Income","ir3Refs":["11B","11C"],"summaryKey":null},{"mode":"manual","supports":"Crypto transaction history","section":"Crypto","ir3Refs":["crypto"],"summaryKey":null}]}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["document"]["evidenceLinks"])==2 and {item["supports"] for item in d["document"]["evidenceLinks"]}=={"PAYE income", "Crypto transaction history"}'

# income + crypto
curl -s -X POST "$BASE/workspaces/$WS/income/paye" -H 'content-type: application/json' -d '{"gross":100000,"payeWithheld":10000}' >/dev/null
curl -s -X PATCH "$BASE/workspaces/$WS/review/warnings/MISSING_STUDENT_LOAN_DOC/evidence" -H 'content-type: application/json' -d '{"mode":"manual","documentIds":["'"$DOC_ID"'"]}' >/dev/null
python3 - <<'PY' > /tmp/nztax_smoke_crypto.json
import json
csv = 'date,asset,type,amount,price_nzd,fee_nzd,exchange\n2025-06-01,BTC,buy,0.01,100000,15,Binance'
print(json.dumps({'csv': csv}))
PY
curl -s -X POST "$BASE/workspaces/$WS/crypto/import-csv" -H 'content-type: application/json' --data-binary @/tmp/nztax_smoke_crypto.json | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["imported"]==1'

# ir3 map/calc/export/audit
curl -s -X PUT "$BASE/workspaces/$WS/adjustments" -H 'content-type: application/json' -d '{"pieIncome":1000.125,"pieTaxCredits":350.999,"extraTaxDeducted":125.555,"studentLoanRepayments":0,"donationAmount":0}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["adjustments"]["pieIncome"] == 1000.13 and d["adjustments"]["pieTaxCredits"] == 351 and d["adjustments"]["extraTaxDeducted"] == 125.56 and d["adjustments"]["donationAmount"] == 0'
curl -s "$BASE/workspaces/$WS/documents/$DONATION_DOC_ID/donation-amount" -X PATCH -H 'content-type: application/json' -d '{"donationAmount":175}' | python3 -c 'import sys,json; d=json.load(sys.stdin); assert d["document"]["donationAmount"] == 175'
curl -s "$BASE/workspaces/$WS/ir3/map" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "map" in d and d["map"]["summary"]["donationReceiptAmount"] == 175 and d["map"]["summary"]["donationAmount"] == 175 and d["map"]["summary"]["pieIncome"] == 1000.13 and d["map"]["summary"]["pieTaxCredits"] == 351 and d["map"]["summary"]["extraTaxDeducted"] == 125.56 and d["map"]["36A"] == 476.56'
curl -s "$BASE/workspaces/$WS/ir3/calc" | python3 -c 'import sys,json; d=json.load(sys.stdin); status=d["calc"]["summary"]["provisionalTaxStatus"]; assert "calc" in d and "map" in d and d["calc"]["summary"]["donationClaim"] > 50 and status["threshold"] == 5000 and status["standardOptionUpliftRate"] == 0.05 and status["relevant"] is True and status["estimatedStandardOptionTax"] == d["calc"]["summary"]["provisionalTax"]'
curl -s "$BASE/workspaces/$WS/export/draft" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "csv" in d and "pdf" in d and "json" in d and d["json"]["workspace"]["id"] and d["pdf"]["mimeType"]=="application/pdf" and d["pdf"]["bytesBase64"] and d["review"]["crypto"]["intro"] and any(item["activity"].startswith("Selling crypto") for item in d["review"]["crypto"]["taxableActivities"]) and any("PIE income" in bullet for bullet in d["explanation"]["bullets"]) and any("other tax already deducted" in bullet for bullet in d["explanation"]["bullets"]) and d["json"]["checklist"] and any(section["name"]=="Review Readiness" for section in d["pdf"]["sections"]) and any(section["name"]=="Supporting Document Checklist" for section in d["pdf"]["sections"])'
curl -s "$BASE/workspaces/$WS/review" | python3 -c 'import sys,json; d=json.load(sys.stdin); review=d["review"]; supports={(item["supports"], tuple(item["ir3Refs"])) for item in review["evidence"] if item["documentType"] == "crypto_csv"}; crypto_warning=next((warning for warning in review["warnings"] if warning["code"]=="CRYPTO_EVIDENCE_MISSING"), None); student_warning=next((warning for warning in review["warnings"] if warning["code"]=="MISSING_STUDENT_LOAN_DOC"), None); pie_warning=next((warning for warning in review["warnings"] if warning["code"]=="PIE_CREDITS_HIGH_FOR_INCOME"), None); provisional_warning=next((warning for warning in review["warnings"] if warning["code"]=="PROVISIONAL_TAX_RISK"), None); loan_status=review["summary"]["studentLoanStatus"]; provisional_status=review["summary"]["provisionalTaxStatus"]; assert review["crypto"]["status"]["hasCryptoCsv"] is True and review["crypto"]["transactionCounts"]["buy"] == 1 and "NZD value" in " ".join(review["crypto"]["whatToProvide"]) and ("PAYE income", ("11B", "11C")) in supports and ("Crypto transaction history", ("crypto",)) in supports and crypto_warning is None and student_warning and student_warning["evidenceOverride"]["mode"]=="manual" and student_warning["evidence"][0]["documentId"] and pie_warning and provisional_warning and "standard option" in provisional_warning["message"].lower() and provisional_status["relevant"] is True and provisional_status["threshold"] == 5000 and provisional_status["estimatedStandardOptionTax"] > provisional_status["modeledResidualIncomeTax"] and review["summary"]["pieIncome"] == 1000.13 and review["summary"]["pieTaxCredits"] == 351 and review["summary"]["extraTaxDeducted"] == 125.56 and loan_status["hasStudentLoan"] is True and loan_status["hasStatement"] is False and loan_status["status"] == "needs_attention"'
curl -s "$BASE/workspaces/$WS/audit" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["events"]) >= 5 and d["events"][0]["label"] and d["events"][0]["category"] and d["summary"]["totalEvents"] >= 5 and "crypto" in d["availableCategories"]'
curl -s "$BASE/workspaces/$WS/audit?category=crypto" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert len(d["events"]) == 1 and d["events"][0]["action"]=="crypto.import_csv" and d["events"][0]["details"]=="1 transaction imported"'
curl -s "$BASE/workspaces/$WS/audit?q=PAYE" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert any(event["label"]=="PAYE added" for event in d["events"])'

echo "SMOKE_OK"
