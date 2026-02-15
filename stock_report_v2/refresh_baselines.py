#!/usr/bin/env python3
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import numpy as np
import yfinance as yf

OUTDIR = Path('/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs')

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

UNIVERSES = {
    'US': ['MSFT','AAPL','NVDA','AMZN','GOOGL','META','BRK-B','AVGO','JPM','LLY','XOM','V','UNH','COST','MA','ORCL','JNJ','PG','HD','ABBV'],
    'AU': ['CBA.AX','BHP.AX','CSL.AX','NAB.AX','WBC.AX','ANZ.AX','MQG.AX','WES.AX','WOW.AX','GMG.AX','RIO.AX','TLS.AX','TCL.AX','QBE.AX','COL.AX'],
    'NZ': ['AIR.NZ','SPK.NZ','FPH.NZ','MEL.NZ','MFT.NZ','AIA.NZ','EBOS.NZ','GNE.NZ','SUM.NZ','RBD.NZ','IFT.NZ','MFM.NZ','OCA.NZ','KMD.NZ','VCT.NZ']
}


def sn(x):
    try:
        x = float(x)
        if np.isnan(x):
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

    fpe = sn(info.get('forwardPE'))
    tpe = sn(info.get('trailingPE'))
    pe = fpe if fpe is not None else tpe

    mcap = sn(info.get('marketCap'))
    fcf_yield = (fcf / mcap) if (fcf is not None and mcap not in (None, 0)) else None

    return {
        'Revenue Growth': sn(info.get('revenueGrowth')),
        'EPS Growth': sn(info.get('earningsGrowth')),
        'EBITDA Margin': ebitda_margin,
        'Net Margin': net_margin,
        'ROIC': roic,
        'FCF Margin': fcf_margin,
        'Net Debt / EBITDA': nde,
        'Forward P/E': pe,
        'FCF Yield': fcf_yield,
    }


def build_market(market):
    symbols = UNIVERSES[market]
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
            ranges[metric] = {'direction': direction, 'poor': None, 'average': None, 'good': None, 'sampleSize': 0}
            continue

        b = float(np.nanmedian(arr))
        baselines[metric] = b

        if direction == 'higher':
            poor = {'lt': 0.7 * b}
            avg = {'gte': 0.7 * b, 'lte': 1.3 * b}
            good = {'gt': 1.3 * b}
        else:
            good = {'lt': 0.7 * b}
            avg = {'gte': 0.7 * b, 'lte': 1.3 * b}
            poor = {'gt': 1.3 * b}

        ranges[metric] = {'direction': direction, 'poor': poor, 'average': avg, 'good': good, 'sampleSize': int(arr.size)}

    now = datetime.now(timezone.utc)
    payload = {
        'market': market,
        'method': 'Median baseline from local market universe via yfinance info fields; ranges 0.7x/1.3x around baseline',
        'refreshedAt': now.isoformat(),
        'validUntil': (now + timedelta(days=7)).isoformat(),
        'symbolsConfigured': symbols,
        'symbolsUsedCount': len(used),
        'baselines': baselines,
        'ranges': ranges,
    }

    out = OUTDIR / f'market_ranges_{market.lower()}.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, 'w') as f:
        json.dump(payload, f, indent=2)
    return out, payload


if __name__ == '__main__':
    import sys
    mkts = [m.upper() for m in sys.argv[1:]] or ['US', 'AU', 'NZ']
    for m in mkts:
        if m not in UNIVERSES:
            print(f'SKIP unknown market: {m}')
            continue
        out, p = build_market(m)
        print(str(out))
        print('refreshedAt', p['refreshedAt'])
        print('validUntil', p['validUntil'])
        print('symbolsUsed', p['symbolsUsedCount'])
