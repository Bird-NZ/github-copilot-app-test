# Stock Report v1 (locked)

Activation phrase:
- "analyze <TICKER>"
- "run report for <TICKER>"

Command:
```bash
/home/mat/.openclaw/workspace/agents/hal/stock_analysis/.venv/bin/python \
  /home/mat/.openclaw/workspace/stock_report_v1/generate_report.py <TICKER>
```

Outputs (3 pages) are written to:
- `/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs`

Version notes:
- 9-metric model (Interest Coverage removed)
- SPX baseline cache from weekly SPY-top-holdings median
- Page 1 includes weighted score columns and final score (0-100)
- Page 2 chart pack (3Y)
- Page 3 metric definitions and measurement periods
