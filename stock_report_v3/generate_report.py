#!/usr/bin/env python3
import json, textwrap
from datetime import datetime
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf

ROOT = Path('/home/mat/.openclaw/workspace')
OUTDIR = ROOT / 'agents/hal/stock_analysis/outputs'
CACHE_BY_MARKET = {
    'US': OUTDIR / 'market_ranges_us.json',
    'AU': OUTDIR / 'market_ranges_au.json',
    'NZ': OUTDIR / 'market_ranges_nz.json',
}

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

# Style
BG = '#F4F7FB'; NAVY = '#0B1F3A'; INDIGO = '#123A63'; BORDER = '#D7DEE8'
TXT = '#111827'; SUB = '#4B5563'; GOOD = '#2E8B57'; AVG = '#D4A017'; BAD = '#B22222'


def normalize_symbol(sym: str) -> str:
    s = sym.strip().upper()
    if s.startswith('NZX:'): return s.split(':',1)[1] + '.NZ'
    if s.startswith('ASX:'): return s.split(':',1)[1] + '.AX'
    return s


def resolve_market(sym: str, explicit: str | None = None) -> str | None:
    if explicit and explicit.upper() in ('US','AU','NZ'):
        return explicit.upper()
    s = sym.upper()
    if s.endswith('.NZ'): return 'NZ'
    if s.endswith('.AX'): return 'AU'
    return None


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
    if v is None or (isinstance(v, float) and np.isnan(v)): return 'N/A'
    if metric in ['Net Debt / EBITDA','Forward P/E']: return f'{v:.2f}x'
    return f'{v*100:.2f}%'


def fmt_band(metric, b):
    if not isinstance(b, dict): return 'N/A'
    if 'lt' in b:
        v = b['lt']
        return f"< {v:.2f}x" if metric in ['Net Debt / EBITDA','Forward P/E'] else f"< {v*100:.2f}%"
    if 'gt' in b:
        v = b['gt']
        return f"> {v:.2f}x" if metric in ['Net Debt / EBITDA','Forward P/E'] else f"> {v*100:.2f}%"
    if 'gte' in b and 'lte' in b:
        lo, hi = b['gte'], b['lte']
        if metric in ['Net Debt / EBITDA','Forward P/E']:
            lo, hi = sorted([lo, hi]); return f"{lo:.2f}x to {hi:.2f}x"
        return f"{lo*100:.2f}% to {hi*100:.2f}%"
    return 'N/A'


def wrap(s, w):
    return '\n'.join(textwrap.wrap(str(s), width=w, break_long_words=False, break_on_hyphens=False))


def metric_score(metric, v, b):
    if v is None or b is None or np.isnan(v) or np.isnan(b): return np.nan
    r = (v / b) if metric in HIGHER else (b / v if v != 0 else np.nan)
    if np.isnan(r): return np.nan
    if r <= 0.4: s = 0
    elif r < 0.7: s = (r - 0.4) / 0.3 * 40
    elif r < 1.0: s = 40 + (r - 0.7) / 0.3 * 20
    elif r < 1.3: s = 60 + (r - 1.0) / 0.3 * 20
    elif r < 1.8: s = 80 + (r - 1.3) / 0.5 * 20
    else: s = 100
    return max(0, min(100, s))


def cls_color(c):
    return GOOD if c == 'Good' else (AVG if c == 'Average' else (BAD if c == 'Poor' else SUB))


def generate(symbol='MSFT', market=None):
    symbol = normalize_symbol(symbol)
    market = resolve_market(symbol, market)
    if market is None:
        raise SystemExit(f"Market not specified for '{symbol}'. Please specify US/AU/NZ or use .AX/.NZ (ASX:/NZX:).")

    cache_path = CACHE_BY_MARKET[market]
    if not cache_path.exists():
        raise SystemExit(f"Missing baseline cache for {market}: {cache_path}")
    with open(cache_path) as f:
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
                if pp > 0: eps = nn/pp - 1
    except Exception:
        pass
    if np.isnan(eps): eps = sn(info.get('earningsGrowth'))
    vals['EPS Growth'] = eps
    vals['EBITDA Margin'] = sn(info.get('ebitdaMargins'))
    vals['Net Margin'] = sn(info.get('profitMargins'))
    roic = sn(info.get('returnOnCapital'))
    if np.isnan(roic): roic = sn(info.get('returnOnEquity'))
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
            if m in HIGHER: cls = 'Poor' if v < p['lt'] else ('Good' if v > g['gt'] else 'Average')
            else: cls = 'Poor' if v > p['gt'] else ('Good' if v < g['lt'] else 'Average')
        ms = metric_score(m, v, b)
        w = WEIGHTS[m]
        pts = np.nan if np.isnan(ms) else ms*(w/100)
        rows.append([m, fmt(m, v), fmt(m, b), fmt_band(m, p), fmt_band(m, a), fmt_band(m, g), cls, w, ms, pts])

    df = pd.DataFrame(rows, columns=['Metric',f'{symbol} Value','Baseline','Poor','Average','Good','Class','Weight %','Metric Score','Weighted Points'])
    final = float(df['Weighted Points'].fillna(0).sum())

    # sub-scores for card row
    def card(cols):
        sub = df[df['Metric'].isin(cols)]
        w = sub['Weight %'].sum()
        return round((sub['Weighted Points'].fillna(0).sum()/w)*100,1) if w>0 else np.nan
    quality = card(['ROIC','Net Margin','EBITDA Margin'])
    valuation = card(['Forward P/E','FCF Yield'])
    growth = card(['Revenue Growth','EPS Growth'])
    balance = card(['Net Debt / EBITDA'])
    cashflow = card(['FCF Margin'])

    stamp = datetime.now().strftime('%Y%m%d_%H%M')
    footer = f"Acronyms: TTM, YoY, EPS, EBITDA, ROIC, ROE, FCF, P/E | Market baseline={market}"

    # PAGE 1
    p1 = OUTDIR / f'{symbol}_v3_Page1_{stamp}.png'
    fig = plt.figure(figsize=(11.69,8.27), dpi=220); fig.patch.set_facecolor(BG)
    ax = fig.add_axes([0,0,1,1]); ax.axis('off')
    ax.add_patch(plt.Rectangle((0,0.91),1,0.09,color=NAVY,transform=ax.transAxes))
    fig.text(0.03,0.945,f'Page 1 — {symbol} ({market}) Investment Snapshot + Weighted Score',fontsize=16,color='white',weight='bold')
    fig.text(0.03,0.918,f"Baseline refresh: {c['refreshedAt']} | valid until: {c['validUntil']}",fontsize=8.2,color='#dbe4f2')
    fig.text(0.72,0.918,f"FINAL SCORE {final:.1f}/100",fontsize=12,color='white',weight='bold')

    cards = [('Quality',quality),('Valuation',valuation),('Growth',growth),('Balance',balance),('Cash Flow',cashflow)]
    for i,(name,val) in enumerate(cards):
        x = 0.03 + i*0.19
        ax.add_patch(plt.Rectangle((x,0.80),0.17,0.08,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
        fig.text(x+0.01,0.853,name,fontsize=8,color=SUB)
        fig.text(x+0.01,0.823,'N/A' if np.isnan(val) else f"{val:.1f}",fontsize=13,color=TXT,weight='bold')

    ax.add_patch(plt.Rectangle((0.02,0.18),0.96,0.60,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
    cell=[]
    for _,r in df.iterrows():
        cell.append([wrap(r['Metric'],18),r[f'{symbol} Value'],r['Baseline'],r['Poor'],r['Average'],r['Good'],r['Class'],f"{int(r['Weight %'])}%",'N/A' if pd.isna(r['Metric Score']) else f"{r['Metric Score']:.1f}",'N/A' if pd.isna(r['Weighted Points']) else f"{r['Weighted Points']:.1f}"])
    t=ax.table(cellText=cell,colLabels=['Metric',symbol,'Baseline','Poor','Average','Good','Class','Wgt','Score','Pts'],colWidths=[0.16,0.08,0.09,0.09,0.11,0.09,0.07,0.05,0.08,0.06],bbox=[0.03,0.20,0.94,0.56],cellLoc='left',colLoc='left')
    t.auto_set_font_size(False); t.set_fontsize(8.0); t.scale(1,1.18)
    for (rr,cc),c0 in t.get_celld().items():
        if rr==0:
            c0.set_text_props(weight='bold',color='white'); c0.set_facecolor(INDIGO)
        else:
            c0.set_edgecolor(BORDER); c0.set_facecolor('#F9FBFE' if rr%2==0 else 'white')
            if cc==6:
                c0.set_text_props(color=cls_color(c0.get_text().get_text()),weight='bold')
    fig.text(0.03,0.15,'Thesis: 1) Margin quality is resilient  2) Track debt/valuation drift  3) Re-rate if growth decelerates further.',fontsize=8.6,color=SUB)
    fig.text(0.03,0.05,footer,fontsize=7.8,color=SUB)
    fig.savefig(p1,bbox_inches='tight'); plt.close(fig)

    # PAGE 2
    p2 = OUTDIR / f'{symbol}_v3_Page2_{stamp}.png'
    hist=n.history(period='3y',interval='1d',auto_adjust=True)
    close=hist['Close'].dropna()
    hist['MA20']=close.rolling(20).mean(); hist['MA50']=close.rolling(50).mean(); hist['MA200']=close.rolling(200).mean()
    d=close.diff(); up=d.clip(lower=0); dn=-d.clip(upper=0); hist['RSI14']=100-(100/(1+(up.rolling(14).mean()/dn.rolling(14).mean())))
    hist['Ret']=close.pct_change(); hist['CumRet']=(1+hist['Ret'].fillna(0)).cumprod()-1; rollmax=close.cummax(); hist['Drawdown']=close/rollmax-1

    fig=plt.figure(figsize=(11.69,8.27),dpi=220); fig.patch.set_facecolor(BG)
    axbg=fig.add_axes([0,0,1,1]); axbg.axis('off')
    axbg.add_patch(plt.Rectangle((0,0.91),1,0.09,color=NAVY,transform=axbg.transAxes))
    fig.text(0.03,0.945,f'Page 2 — {symbol} ({market}) Performance + Financial Lens (3Y)',fontsize=15,color='white',weight='bold')
    axbg.add_patch(plt.Rectangle((0.03,0.14),0.62,0.74,facecolor='white',edgecolor=BORDER,transform=axbg.transAxes))
    axbg.add_patch(plt.Rectangle((0.67,0.14),0.30,0.74,facecolor='white',edgecolor=BORDER,transform=axbg.transAxes))

    positions=[[0.06,0.53,0.27,0.30],[0.35,0.53,0.27,0.30],[0.06,0.18,0.27,0.30],[0.35,0.18,0.27,0.30]]
    axs=[fig.add_axes(p) for p in positions]
    axs[0].plot(hist.index,hist['Close'],color='#1F77B4',lw=1.4); axs[0].plot(hist.index,hist['MA20'],lw=0.9); axs[0].plot(hist.index,hist['MA50'],lw=0.9); axs[0].plot(hist.index,hist['MA200'],lw=0.9); axs[0].set_title('Price + MAs',fontsize=9); axs[0].grid(alpha=0.2)
    axs[1].bar(hist.index,hist['Volume']/1e6,color='#89B4D8'); axs[1].set_title('Volume (M)',fontsize=9); axs[1].grid(alpha=0.2)
    axs[2].plot(hist.index,hist['RSI14'],color='#6A1B9A',lw=1.1); axs[2].axhline(70,ls='--',lw=0.8); axs[2].axhline(30,ls='--',lw=0.8); axs[2].set_ylim(0,100); axs[2].set_title('RSI 14',fontsize=9); axs[2].grid(alpha=0.2)
    axs[3].plot(hist.index,hist['CumRet']*100,color='#1565C0',lw=1.2); axs[3].fill_between(hist.index,hist['Drawdown']*100,0,color='#EF5350',alpha=0.2); axs[3].set_title('Return & Drawdown %',fontsize=9); axs[3].grid(alpha=0.2)
    for a in axs: a.tick_params(labelsize=7)

    # right financial lens cards
    lens=[('Revenue Growth',vals['Revenue Growth']),('Net Margin',vals['Net Margin']),('FCF Margin',vals['FCF Margin']),('Net Debt/EBITDA',vals['Net Debt / EBITDA'])]
    y=0.78
    for name,val in lens:
        axbg.add_patch(plt.Rectangle((0.69,y),0.26,0.14,facecolor='#F9FBFE',edgecolor=BORDER,transform=axbg.transAxes))
        fig.text(0.705,y+0.10,name,fontsize=9,color=SUB)
        display = fmt('Forward P/E' if 'Debt' in name else name,val)
        fig.text(0.705,y+0.055,display,fontsize=14,color=TXT,weight='bold')
        y-=0.17

    fig.text(0.03,0.05,footer,fontsize=7.6,color=SUB)
    fig.savefig(p2,bbox_inches='tight'); plt.close(fig)

    # PAGE 3
    p3 = OUTDIR / f'{symbol}_v3_Page3_{stamp}.png'
    rows=[
      ('Revenue Growth','Growth in company sales; top-line momentum.','TTM YoY proxy: latest 4 quarters vs prior 4.','revenueGrowth / quarterly revenue','N/A if unavailable'),
      ('EPS Growth','Growth in earnings per share.','TTM YoY proxy: latest 4 EPS vs prior 4.','earningsGrowth / earnings dates','N/A if unavailable'),
      ('EBITDA Margin','Operating profitability before D&A, interest, tax.','Latest snapshot','ebitdaMargins','N/A if unavailable'),
      ('Net Margin','Net income as % of revenue.','Latest snapshot','profitMargins','N/A if unavailable'),
      ('ROIC (fallback ROE)','Capital efficiency.','Latest snapshot','returnOnCapital / returnOnEquity','Use ROE fallback'),
      ('FCF Margin','Free cash flow per dollar revenue.','Latest snapshot','freeCashflow / totalRevenue','N/A if unavailable'),
      ('Net Debt / EBITDA','Leverage measure (lower better).','Latest snapshot','(totalDebt-totalCash)/ebitda','N/A if unavailable'),
      ('Forward P/E','Forward valuation multiple.','Point-in-time','forwardPE (fallback trailingPE)','Use trailing if forward missing'),
      ('FCF Yield','FCF relative to market cap.','Point-in-time','freeCashflow / marketCap','N/A if unavailable'),
      (f'{market} Baseline','Market reference range anchor.','Weekly refresh, valid 7 days',f'market_ranges_{market.lower()}.json','Ask market if ticker ambiguous'),
    ]
    fig=plt.figure(figsize=(11.69,8.27),dpi=220); fig.patch.set_facecolor(BG)
    ax=fig.add_axes([0,0,1,1]); ax.axis('off')
    ax.add_patch(plt.Rectangle((0,0.91),1,0.09,color=NAVY,transform=ax.transAxes))
    fig.text(0.03,0.945,f'Page 3 — {symbol} ({market}) Methodology, Definitions & Data Rules',fontsize=14.5,color='white',weight='bold')
    cell=[[wrap(a,18),wrap(b,44),wrap(c,34),wrap(d,28),wrap(e,24)] for a,b,c,d,e in rows]
    t2=ax.table(cellText=cell,colLabels=['Metric','Meaning','Period','Source fields','Fallback'],colWidths=[0.17,0.28,0.18,0.19,0.15],bbox=[0.03,0.14,0.94,0.73],cellLoc='left',colLoc='left')
    t2.auto_set_font_size(False); t2.set_fontsize(7.9); t2.scale(1,1.22)
    for (rr,cc),c0 in t2.get_celld().items():
        if rr==0: c0.set_text_props(weight='bold',color='white'); c0.set_facecolor(INDIGO)
        else: c0.set_edgecolor(BORDER); c0.set_facecolor('#F9FBFE' if rr%2==0 else 'white')
    fig.text(0.03,0.07,footer,fontsize=7.7,color=SUB)
    fig.savefig(p3,bbox_inches='tight'); plt.close(fig)

    print(p1); print(p2); print(p3)
    print('MARKET', market)
    print('FINAL', round(final,1))


if __name__ == '__main__':
    import sys
    sym = sys.argv[1] if len(sys.argv)>1 else 'MSFT'
    mkt = sys.argv[2] if len(sys.argv)>2 else None
    generate(sym, mkt)
