#!/usr/bin/env bash
set -euo pipefail

TO_EMAIL="${1:-}"
if [[ -z "$TO_EMAIL" ]]; then
  echo "Usage: $0 recipient@example.com" >&2
  exit 1
fi

python3 /home/mat/.openclaw/workspace/tools/email-smtp/send_email.py \
  --to "$TO_EMAIL" \
  --subject "Mission Control LAN Setup Instructions" \
  --body-file /home/mat/.openclaw/workspace/mission-control/Mission-Control-LAN-Setup.txt \
  --attach /home/mat/.openclaw/workspace/mission-control/Mission-Control-LAN-Setup.txt
