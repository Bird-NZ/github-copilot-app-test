#!/usr/bin/env python3
import json, textwrap
from datetime import datetime
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf

ROOT = Path('/home/mat/.openclaw/workspace')
CACHE = ROOT / 'agents/hal/stock_analysis/outputs/spx_ranges_cache.json'
OUTDIR = ROOT / 'agents/hal/stock_analysis/outputs'

WEIGHTS = {
    'Revenue Growth': 10,
    'EPS Growth': 12,
    'EBITDA Margin': 6,
    'Net Margin': 12,
    'ROIC': 16,
    'FCF Margin': 14,
    'Net Debt / EBITDA': 12,
    'Forward P/E': 10,
    'FCF Yield': 8,
}

HIGHER = {'Revenue Growth','EPS Growth','EBITDA Margin','Net Margin','ROIC','FCF Margin','FCF Yield'}


def sn(x):
    try:
        x = float(x)
        return np.nan if np.isnan(x) else x
    except Exception:
        return np.nan


def ttm(df, row, start=0):
    try:
        if row in df.index and df.shape[1] >= start + 4:
            return float(df.loc[row].iloc[start:start+4].sum())
    except Exception:
        pass
    return np.nan


def fmt(metric, v):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return 'N/A'
    if metric in ['Net Debt / EBITDA','Forward P/E']:
        return f'{v:.2f}x'
    return f'{v*100:.2f}%'


def fmt_band(metric, b):
    if not isinstance(b, dict):
        return 'N/A'
    if 'lt' in b:
        v = b['lt']
        return f"< {v:.2f}x" if metric in ['Net Debt / EBITDA','Forward P/E'] else f"< {v*100:.2f}%"
    if 'gt' in b:
        v = b['gt']
        return f"> {v:.2f}x" if metric in ['Net Debt / EBITDA','Forward P/E'] else f"> {v*100:.2f}%"
    if 'gte' in b and 'lte' in b:
        lo, hi = b['gte'], b['lte']
        if metric in ['Net Debt / EBITDA','Forward P/E']:
            lo, hi = sorted([lo, hi])
            return f"{lo:.2f}x to {hi:.2f}x"
        return f"{lo*100:.2f}% to {hi*100:.2f}%"
    return 'N/A'


def wrap(s, w):
    return '\n'.join(textwrap.wrap(str(s), width=w, break_long_words=False, break_on_hyphens=False))


def metric_score(metric, v, b):
    if v is None or b is None or np.isnan(v) or np.isnan(b):
        return np.nan
    r = (v / b) if metric in HIGHER else (b / v if v != 0 else np.nan)
    if np.isnan(r):
        return np.nan
    if r <= 0.4:
        s = 0
    elif r < 0.7:
        s = (r - 0.4) / 0.3 * 40
    elif r < 1.0:
        s = 40 + (r - 0.7) / 0.3 * 20
    elif r < 1.3:
        s = 60 + (r - 1.0) / 0.3 * 20
    elif r < 1.8:
        s = 80 + (r - 1.3) / 0.5 * 20
    else:
        s = 100
    return max(0, min(100, s))


def generate(symbol='MSFT'):
    with open(CACHE) as f:
        c = json.load(f)
    baselines, ranges = c['baselines'], c['ranges']

    n = yf.Ticker(symbol)
    info = n.info or {}
    isq = n.quarterly_income_stmt if n.quarterly_income_stmt is not None else pd.DataFrame()

    vals = {}
    cur, prev = ttm(isq, 'Total Revenue', 0), ttm(isq, 'Total Revenue', 4)
    vals['Revenue Growth'] = cur/prev - 1 if (prev and prev > 0) else sn(info.get('revenueGrowth'))

    eps = np.nan
    try:
        ed = n.get_earnings_dates(limit=16)
        if ed is not None and not ed.empty and 'Reported EPS' in ed.columns:
            e = ed['Reported EPS'].dropna().astype(float)
            if len(e) >= 8:
                nn, pp = e.iloc[:4].sum(), e.iloc[4:8].sum()
                if pp > 0:
                    eps = nn/pp - 1
    except Exception:
        pass
    if np.isnan(eps):
        eps = sn(info.get('earningsGrowth'))
    vals['EPS Growth'] = eps
    vals['EBITDA Margin'] = sn(info.get('ebitdaMargins'))
    vals['Net Margin'] = sn(info.get('profitMargins'))
    roic = sn(info.get('returnOnCapital'))
    if np.isnan(roic):
        roic = sn(info.get('returnOnEquity'))
    vals['ROIC'] = roic
    fcf, rev = sn(info.get('freeCashflow')), sn(info.get('totalRevenue'))
    vals['FCF Margin'] = (fcf/rev) if (not np.isnan(fcf) and not np.isnan(rev) and rev != 0) else np.nan
    debt, cash, ebitda = sn(info.get('totalDebt')), sn(info.get('totalCash')), sn(info.get('ebitda'))
    vals['Net Debt / EBITDA'] = ((debt-cash)/ebitda) if (not np.isnan(debt) and not np.isnan(cash) and not np.isnan(ebitda) and ebitda != 0) else np.nan
    fpe, tpe = sn(info.get('forwardPE')), sn(info.get('trailingPE'))
    vals['Forward P/E'] = fpe if not np.isnan(fpe) else tpe
    mcap = sn(info.get('marketCap'))
    vals['FCF Yield'] = (fcf/mcap) if (not np.isnan(fcf) and not np.isnan(mcap) and mcap != 0) else np.nan

    rows = []
    for m, v in vals.items():
        b = baselines.get(m)
        r = ranges.get(m, {})
        p, a, g = r.get('poor'), r.get('average'), r.get('good')
        cls = 'N/A'
        if not np.isnan(v) and p and a and g:
            if m in HIGHER:
                cls = 'Poor' if v < p['lt'] else ('Good' if v > g['gt'] else 'Average')
            else:
                cls = 'Poor' if v > p['gt'] else ('Good' if v < g['lt'] else 'Average')
        ms = metric_score(m, v, b)
        w = WEIGHTS[m]
        pts = np.nan if np.isnan(ms) else ms*(w/100)
        rows.append([m, fmt(m, v), fmt(m, b), fmt_band(m, p), fmt_band(m, a), fmt_band(m, g), cls, w, ms, pts])

    df = pd.DataFrame(rows, columns=['Metric',f'{symbol} Value','Baseline','Poor','Average','Good','Class','Weight %','Metric Score','Weighted Points'])
    final = df['Weighted Points'].fillna(0).sum()

    footer = "Acronyms: TTM, YoY, EPS, EBITDA, ROIC, ROE, FCF, P/E, SPX, SPY"
    stamp = datetime.now().strftime('%Y%m%d_%H%M')

    # page 1
    p1 = OUTDIR / f'{symbol}_v1_Page1_{stamp}.png'
    fig = plt.figure(figsize=(11.69,8.27), dpi=220)
    ax = fig.add_axes([0,0,1,1]); ax.axis('off')
    ax.add_patch(plt.Rectangle((0,0.91),1,0.09,color='#0b1f3a',transform=ax.transAxes))
    fig.text(0.03,0.945,f'Page 1 — {symbol} Fundamental Classification + Weighted Score (0–100)',fontsize=15,color='white',weight='bold')
    fig.text(0.03,0.918,f"Range refresh: {c['refreshedAt']} | Valid until: {c['validUntil']}",fontsize=8.3,color='#dbe4f2')
    fig.text(0.67,0.918,f"FINAL SCORE: {final:.1f}/100",fontsize=11,color='white',weight='bold')
    cell=[]
    for _,r in df.iterrows():
        cell.append([wrap(r['Metric'],18),r[f'{symbol} Value'],r['Baseline'],r['Poor'],r['Average'],r['Good'],r['Class'],f"{int(r['Weight %'])}%",'N/A' if pd.isna(r['Metric Score']) else f"{r['Metric Score']:.1f}",'N/A' if pd.isna(r['Weighted Points']) else f"{r['Weighted Points']:.1f}"])
    t=ax.table(cellText=cell,colLabels=['Metric',symbol,'Baseline','Poor','Average','Good','Class','Wgt','Score','Pts'],colWidths=[0.16,0.08,0.09,0.09,0.11,0.09,0.07,0.05,0.08,0.06],bbox=[0.02,0.18,0.96,0.68],cellLoc='left',colLoc='left')
    t.auto_set_font_size(False); t.set_fontsize(8.0); t.scale(1,1.2)
    for (rr,cc),c0 in t.get_celld().items():
        if rr==0:
            c0.set_text_props(weight='bold',color='white'); c0.set_facecolor('#123a63')
        else:
            c0.set_edgecolor('#d9e1ea'); c0.set_facecolor('#f8fbff' if rr%2==0 else 'white')
    fig.text(0.02,0.10,footer,fontsize=7.8,color='#555')
    fig.savefig(p1,bbox_inches='tight'); plt.close(fig)

    # page 2
    p2 = OUTDIR / f'{symbol}_v1_Page2_{stamp}.png'
    hist=n.history(period='3y',interval='1d',auto_adjust=True)
    close=hist['Close'].dropna(); hist['MA20']=close.rolling(20).mean(); hist['MA50']=close.rolling(50).mean(); hist['MA200']=close.rolling(200).mean()
    d=close.diff(); up=d.clip(lower=0); dn=-d.clip(upper=0); hist['RSI14']=100-(100/(1+(up.rolling(14).mean()/dn.rolling(14).mean())))
    hist['Ret']=close.pct_change(); hist['CumRet']=(1+hist['Ret'].fillna(0)).cumprod()-1; rollmax=close.cummax(); hist['Drawdown']=close/rollmax-1
    fig=plt.figure(figsize=(11.69,8.27),dpi=220)
    axbg=fig.add_axes([0,0,1,1]); axbg.axis('off')
    axbg.add_patch(plt.Rectangle((0,0.91),1,0.09,color='#0b1f3a',transform=axbg.transAxes))
    fig.text(0.03,0.945,f'Page 2 — {symbol} 3-Year Technical & Performance Chart Pack',fontsize=16,color='white',weight='bold')
    axbg.add_patch(plt.Rectangle((0.03,0.14),0.94,0.74,facecolor='white',edgecolor='#d9e1ea',lw=1.0,transform=axbg.transAxes))
    positions=[[0.06,0.53,0.42,0.30],[0.52,0.53,0.42,0.30],[0.06,0.18,0.42,0.30],[0.52,0.18,0.42,0.30]]
    axs=[fig.add_axes(p) for p in positions]
    axs[0].plot(hist.index,hist['Close']); axs[0].plot(hist.index,hist['MA20']); axs[0].plot(hist.index,hist['MA50']); axs[0].plot(hist.index,hist['MA200']); axs[0].set_title('Price & MAs (3Y)',fontsize=10); axs[0].grid(alpha=0.2)
    axs[1].bar(hist.index,hist['Volume']/1e6); axs[1].set_title('Volume (M, 3Y)',fontsize=10); axs[1].grid(alpha=0.2)
    axs[2].plot(hist.index,hist['RSI14']); axs[2].axhline(70,ls='--'); axs[2].axhline(30,ls='--'); axs[2].set_ylim(0,100); axs[2].set_title('RSI 14 (3Y)',fontsize=10); axs[2].grid(alpha=0.2)
    axs[3].plot(hist.index,hist['CumRet']*100,label='CumRet %'); axs[3].fill_between(hist.index,hist['Drawdown']*100,0,alpha=0.2,label='Drawdown %'); axs[3].set_title('Return & Drawdown (3Y)',fontsize=10); axs[3].legend(fontsize=7)
    for a in axs: a.tick_params(labelsize=7)
    fig.text(0.03,0.05,footer,fontsize=7.6,color='#555')
    fig.savefig(p2,bbox_inches='tight'); plt.close(fig)

    # page 3 old style
    p3 = OUTDIR / f'{symbol}_v1_Page3_{stamp}.png'
    rows=[
      ('Revenue Growth','Growth in company sales; indicates top-line momentum.','TTM YoY proxy: latest 4 quarters vs prior 4 quarters.'),
      ('EPS Growth','Growth in earnings per share.','TTM YoY proxy: latest 4 reported EPS quarters vs prior 4.'),
      ('EBITDA Margin','Operating profitability before D&A, interest, and tax.','Latest available TTM-style margin field.'),
      ('Net Margin','Net income as a percentage of revenue.','Latest available TTM-style margin field.'),
      ('ROIC (fallback: ROE)','Capital efficiency. ROE used only if ROIC missing.','Latest available provider field at report run.'),
      ('FCF Margin','Free cash flow generated per dollar of revenue.','TTM FCF divided by latest revenue field.'),
      ('Net Debt / EBITDA','Leverage measure; lower is generally safer.','Latest debt, cash, and EBITDA fields.'),
      ('Forward P/E','Valuation using expected next-year earnings.','Forward P/E at run time (trailing fallback if needed).'),
      ('FCF Yield','Free cash flow relative to market capitalization.','TTM FCF / market cap at run time.'),
      ('SPX Baseline (Proxy)','Benchmark level for range classification.','Weekly refresh using SPY top-holdings median; held for 7 days.'),
    ]
    fig=plt.figure(figsize=(11.69,8.27),dpi=220)
    ax=fig.add_axes([0,0,1,1]); ax.axis('off')
    ax.add_patch(plt.Rectangle((0,0.91),1,0.09,color='#0b1f3a',transform=ax.transAxes))
    fig.text(0.03,0.945,f'Page 3 — {symbol} Metric Definitions and Measurement Periods',fontsize=16,color='white',weight='bold')
    cell=[[wrap(a,24),wrap(b,62),wrap(c,52)] for a,b,c in rows]
    t2=ax.table(cellText=cell,colLabels=['Metric','What it means','Period measured over'],colWidths=[0.22,0.43,0.32],bbox=[0.03,0.14,0.94,0.73],cellLoc='left',colLoc='left')
    t2.auto_set_font_size(False); t2.set_fontsize(8.3); t2.scale(1,1.25)
    for (rr,cc),c0 in t2.get_celld().items():
        if rr==0: c0.set_text_props(weight='bold',color='white'); c0.set_facecolor('#123a63')
        else: c0.set_edgecolor('#d9e1ea'); c0.set_facecolor('#f8fbff' if rr%2==0 else 'white')
    fig.text(0.03,0.07,footer,fontsize=7.7,color='#555')
    fig.savefig(p3,bbox_inches='tight'); plt.close(fig)

    print(p1)
    print(p2)
    print(p3)
    print('FINAL', round(final,1))

if __name__ == '__main__':
    import sys
    sym = sys.argv[1] if len(sys.argv)>1 else 'MSFT'
    generate(sym.upper())
