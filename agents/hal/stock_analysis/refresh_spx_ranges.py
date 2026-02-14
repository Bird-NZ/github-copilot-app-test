#!/usr/bin/env python3
import json
from datetime import datetime, timedelta, timezone
import math
import numpy as np
import yfinance as yf

OUT_PATH = '/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs/spx_ranges_cache.json'

METRICS = [
    ('Revenue Growth', 'higher'),
    ('EPS Growth', 'higher'),
    ('EBITDA Margin', 'higher'),
    ('Net Margin', 'higher'),
    ('ROIC', 'higher'),
    ('FCF Margin', 'higher'),
    ('Net Debt / EBITDA', 'lower'),
    ('Forward P/E', 'lower'),
    ('FCF Yield', 'higher'),
]


def sn(x):
    try:
        x = float(x)
        if math.isnan(x):
            return None
        return x
    except Exception:
        return None


def metric_set(info):
    ebitda_margin = sn(info.get('ebitdaMargins'))
    net_margin = sn(info.get('profitMargins'))
    roic = sn(info.get('returnOnCapital'))
    if roic is None:
        roic = sn(info.get('returnOnEquity'))

    fcf = sn(info.get('freeCashflow'))
    revenue = sn(info.get('totalRevenue'))
    fcf_margin = (fcf / revenue) if (fcf is not None and revenue not in (None, 0)) else None

    debt = sn(info.get('totalDebt'))
    cash = sn(info.get('totalCash'))
    ebitda = sn(info.get('ebitda'))
    nde = ((debt - cash) / ebitda) if (debt is not None and cash is not None and ebitda not in (None, 0)) else None

    interest_exp = sn(info.get('interestExpense'))
    int_cov = abs(ebitda / interest_exp) if (ebitda is not None and interest_exp not in (None, 0)) else None

    fpe = sn(info.get('forwardPE'))
    tpe = sn(info.get('trailingPE'))
    pe = fpe if fpe is not None else tpe

    mcap = sn(info.get('marketCap'))
    fcf_yield = (fcf / mcap) if (fcf is not None and mcap not in (None, 0)) else None

    rev_g = sn(info.get('revenueGrowth'))
    eps_g = sn(info.get('earningsGrowth'))

    return {
        'Revenue Growth': rev_g,
        'EPS Growth': eps_g,
        'EBITDA Margin': ebitda_margin,
        'Net Margin': net_margin,
        'ROIC': roic,
        'FCF Margin': fcf_margin,
        'Net Debt / EBITDA': nde,
        'Forward P/E': pe,
        'FCF Yield': fcf_yield,
    }


def main():
    spy = yf.Ticker('SPY')
    th = spy.funds_data.top_holdings
    symbols = [s for s in th.index.tolist() if isinstance(s, str)][:60]

    values = {m: [] for m, _ in METRICS}
    used = []

    for sym in symbols:
        try:
            info = yf.Ticker(sym).info or {}
            m = metric_set(info)
            used.append(sym)
            for k in values:
                v = m.get(k)
                if v is not None and np.isfinite(v):
                    values[k].append(float(v))
        except Exception:
            continue

    baselines = {}
    ranges = {}

    for metric, direction in METRICS:
        arr = np.array(values[metric], dtype=float)
        if arr.size == 0:
            baselines[metric] = None
            ranges[metric] = {'poor': None, 'average': None, 'good': None, 'direction': direction}
            continue

        b = float(np.nanmedian(arr))
        baselines[metric] = b

        if direction == 'higher':
            poor = {'lt': 0.7 * b}
            average = {'gte': 0.7 * b, 'lte': 1.3 * b}
            good = {'gt': 1.3 * b}
        else:
            good = {'lt': 0.7 * b}
            average = {'gte': 0.7 * b, 'lte': 1.3 * b}
            poor = {'gt': 1.3 * b}

        ranges[metric] = {
            'direction': direction,
            'poor': poor,
            'average': average,
            'good': good,
            'sampleSize': int(arr.size),
        }

    now = datetime.now(timezone.utc)
    payload = {
        'method': 'SPY top holdings (up to 60) median baseline; ranges set as 0.7x/1.3x bands',
        'refreshedAt': now.isoformat(),
        'validUntil': (now + timedelta(days=7)).isoformat(),
        'symbolsUsedCount': len(used),
        'baselines': baselines,
        'ranges': ranges,
        'sourceUrls': {
            'holdings': 'https://finance.yahoo.com/quote/SPY/holdings/',
            'fundamentalsTemplate': 'https://finance.yahoo.com/quote/{SYMBOL}/key-statistics/'
        }
    }

    with open(OUT_PATH, 'w') as f:
        json.dump(payload, f, indent=2)

    print(OUT_PATH)
    print('refreshedAt', payload['refreshedAt'])
    print('validUntil', payload['validUntil'])


if __name__ == '__main__':
    main()
