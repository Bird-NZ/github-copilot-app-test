#!/usr/bin/env python3
import argparse
from datetime import datetime
import pandas as pd
import yfinance as yf


def rsi(series, period=14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -delta.clip(upper=0)
    ma_up = up.rolling(period).mean()
    ma_down = down.rolling(period).mean()
    rs = ma_up / ma_down
    return 100 - (100 / (1 + rs))


def fmt_pct(v):
    return f"{v*100:.2f}%" if pd.notna(v) else "n/a"


def analyze(ticker: str, period: str = "1y", interval: str = "1d"):
    tk = yf.Ticker(ticker)
    hist = tk.history(period=period, interval=interval, auto_adjust=True)
    if hist.empty:
        raise SystemExit(f"No price data returned for {ticker}")

    close = hist["Close"].dropna()
    latest = close.iloc[-1]

    returns = close.pct_change().dropna()
    ma20 = close.rolling(20).mean().iloc[-1]
    ma50 = close.rolling(50).mean().iloc[-1]
    ma200 = close.rolling(200).mean().iloc[-1] if len(close) >= 200 else float("nan")
    rsi14 = rsi(close, 14).iloc[-1]

    perf_1m = close.iloc[-1] / close.iloc[max(0, len(close)-22)] - 1 if len(close) > 22 else float("nan")
    perf_3m = close.iloc[-1] / close.iloc[max(0, len(close)-66)] - 1 if len(close) > 66 else float("nan")
    perf_6m = close.iloc[-1] / close.iloc[max(0, len(close)-132)] - 1 if len(close) > 132 else float("nan")
    perf_1y = close.iloc[-1] / close.iloc[0] - 1 if len(close) > 1 else float("nan")

    vol_30d = returns.tail(30).std() * (252 ** 0.5) if len(returns) >= 30 else float("nan")

    info = tk.fast_info if hasattr(tk, "fast_info") else {}
    mcap = info.get("market_cap", None)
    exch = info.get("exchange", "n/a")
    ccy = info.get("currency", "n/a")

    print(f"\n=== {ticker.upper()} Snapshot ({datetime.now().strftime('%Y-%m-%d %H:%M')}) ===")
    print(f"Exchange/Currency: {exch}/{ccy}")
    print(f"Last Close: {latest:.2f}")
    print(f"MA20 / MA50 / MA200: {ma20:.2f} / {ma50:.2f} / {ma200:.2f}" if pd.notna(ma200) else f"MA20 / MA50: {ma20:.2f} / {ma50:.2f}")
    print(f"RSI(14): {rsi14:.2f}" if pd.notna(rsi14) else "RSI(14): n/a")
    print(f"Perf 1M / 3M / 6M / 1Y: {fmt_pct(perf_1m)} / {fmt_pct(perf_3m)} / {fmt_pct(perf_6m)} / {fmt_pct(perf_1y)}")
    print(f"30D Ann. Volatility: {fmt_pct(vol_30d)}")
    print(f"Market Cap: {mcap:,}" if mcap else "Market Cap: n/a")

    trend = []
    trend.append("above MA20" if latest > ma20 else "below MA20")
    trend.append("above MA50" if latest > ma50 else "below MA50")
    if pd.notna(ma200):
        trend.append("above MA200" if latest > ma200 else "below MA200")

    rsi_view = "neutral"
    if pd.notna(rsi14):
        if rsi14 >= 70:
            rsi_view = "potentially overbought"
        elif rsi14 <= 30:
            rsi_view = "potentially oversold"

    print("\nInterpretation:")
    print(f"- Trend: {', '.join(trend)}")
    print(f"- Momentum (RSI): {rsi_view}")
    print("- Note: Educational analysis only, not financial advice.")


def main():
    p = argparse.ArgumentParser(description="Quick stock analysis (no API keys)")
    p.add_argument("ticker", help="Ticker, e.g. AAPL, NVDA, SPK.NZ")
    p.add_argument("--period", default="1y", help="Data period: 6mo,1y,2y,5y,max")
    p.add_argument("--interval", default="1d", help="Data interval: 1d,1h,etc")
    args = p.parse_args()
    analyze(args.ticker, args.period, args.interval)


if __name__ == "__main__":
    main()
