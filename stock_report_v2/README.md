# Stock Report v2 (locked)

Now supports **US, Australia, and New Zealand** market-specific baselines.

## Activation phrases
- "analyze <TICKER>"
- "stock report <TICKER>"
- "run report for <TICKER>"

## Ticker/market routing rules (to avoid mix-ups)
1. `*.NZ` or `NZX:XXX` -> **NZ baseline**
2. `*.AX` or `ASX:XXX` -> **AU baseline**
3. If no suffix/prefix and no explicit market argument -> **ask user to specify market** (US/AU/NZ)

Examples:
- `AIR.NZ` -> NZ
- `NZX:AIR` -> NZ
- `CBA.AX` -> AU
- `ASX:CBA` -> AU
- `MSFT` -> US

## Commands
Generate report:
```bash
/home/mat/.openclaw/workspace/agents/hal/stock_analysis/.venv/bin/python \
  /home/mat/.openclaw/workspace/stock_report_v2/generate_report.py <TICKER>
```

Refresh market baselines (weekly recommended):
```bash
/home/mat/.openclaw/workspace/agents/hal/stock_analysis/.venv/bin/python \
  /home/mat/.openclaw/workspace/stock_report_v2/refresh_baselines.py US AU NZ
```

## Cache files
- US: `/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs/market_ranges_us.json`
- AU: `/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs/market_ranges_au.json`
- NZ: `/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs/market_ranges_nz.json`

## Version notes
- 9-metric model (Interest Coverage removed)
- Separate weekly baseline caches for US/AU/NZ
- Page 1 includes weighted score columns + final score (0-100)
- Page 2 chart pack (3Y)
- Page 3 metric definitions and measurement periods
