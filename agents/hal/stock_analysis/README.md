# Stock Analysis Toolkit (No API Key)

## Activate environment

```bash
cd /home/mat/.openclaw/workspace/agents/hal/stock_analysis
source .venv/bin/activate
```

## Run analysis

```bash
python analyze_stock.py AAPL
python analyze_stock.py NVDA --period 2y
python analyze_stock.py SPK.NZ --period 1y
```

## Notes
- Uses Yahoo Finance data via `yfinance` (no API key needed).
- NZX symbols typically use `.NZ` suffix.
- Output is educational and not financial advice.
