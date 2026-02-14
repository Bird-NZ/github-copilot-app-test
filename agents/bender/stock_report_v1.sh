#!/usr/bin/env bash
set -euo pipefail
TICKER="${1:-MSFT}"
/home/mat/.openclaw/workspace/agents/hal/stock_analysis/.venv/bin/python \
  /home/mat/.openclaw/workspace/stock_report_v1/generate_report.py "$TICKER"
