#!/usr/bin/env bash
set -euo pipefail
TICKER="${1:-MSFT}"
MARKET="${2:-}"
if [ -n "$MARKET" ]; then
  /home/mat/.openclaw/workspace/agents/hal/stock_analysis/.venv/bin/python \
    /home/mat/.openclaw/workspace/stock_report_v2/generate_report.py "$TICKER" "$MARKET"
else
  /home/mat/.openclaw/workspace/agents/hal/stock_analysis/.venv/bin/python \
    /home/mat/.openclaw/workspace/stock_report_v2/generate_report.py "$TICKER"
fi
