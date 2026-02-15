#!/usr/bin/env python3
import matplotlib.pyplot as plt
from pathlib import Path

OUT = Path('/home/mat/.openclaw/workspace/agents/hal/stock_analysis/outputs')
OUT.mkdir(parents=True, exist_ok=True)

BG = '#F4F7FB'
NAVY = '#0B1F3A'
INDIGO = '#123A63'
BORDER = '#D7DEE8'
TEXT = '#111827'


def header(fig, title):
    ax = fig.add_axes([0,0,1,1]); ax.axis('off')
    ax.add_patch(plt.Rectangle((0,0.91),1,0.09,color=NAVY,transform=ax.transAxes))
    fig.text(0.03,0.945,title,fontsize=20,color='white',weight='bold')
    return ax

# Page 1 preview
fig = plt.figure(figsize=(11.69,8.27),dpi=180)
fig.patch.set_facecolor(BG)
ax = header(fig,'Page 1 — Investment Snapshot (v3 Best-of Template)')
for i,x in enumerate([0.03,0.22,0.41,0.60,0.79]):
    ax.add_patch(plt.Rectangle((x,0.80),0.18,0.08,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
    fig.text(x+0.01,0.85,['Quality','Valuation','Growth','Balance Sheet','Cash Flow'][i],fontsize=9,color='#4B5563')
    fig.text(x+0.01,0.82,['78/100','62/100','71/100','69/100','74/100'][i],fontsize=14,color=TEXT,weight='bold')

ax.add_patch(plt.Rectangle((0.03,0.18),0.94,0.58,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
fig.text(0.04,0.73,'Core metric table area (company vs baseline vs score columns)',fontsize=11,color=TEXT,weight='bold')
ax.add_patch(plt.Rectangle((0.03,0.68),0.94,0.05,facecolor=INDIGO,transform=ax.transAxes))
for i,h in enumerate(['Metric','Value','Baseline','Band','Class','Wgt','Score','Pts']):
    fig.text(0.05 + i*0.11,0.695,h,fontsize=9,color='white',weight='bold')
fig.text(0.04,0.15,'Thesis strip: 3 bullets (what works / what to watch / what changes view)',fontsize=9,color='#4B5563')
fig.savefig(OUT/'stock_report_v3_preview_page1.png',bbox_inches='tight')
plt.close(fig)

# Page 2 preview
fig = plt.figure(figsize=(11.69,8.27),dpi=180)
fig.patch.set_facecolor(BG)
ax = header(fig,'Page 2 — Performance + Financial Lens (v3 Best-of Template)')
ax.add_patch(plt.Rectangle((0.03,0.14),0.62,0.74,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
ax.add_patch(plt.Rectangle((0.67,0.14),0.30,0.74,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
fig.text(0.05,0.84,'Technical chart grid (3Y price, RSI, volume, drawdown)',fontsize=10,color=TEXT,weight='bold')
fig.text(0.69,0.84,'Financial trend mini-panels',fontsize=10,color=TEXT,weight='bold')
for y in [0.75,0.58,0.41,0.24]:
    ax.add_patch(plt.Rectangle((0.69,y),0.26,0.13,facecolor='#F9FBFE',edgecolor=BORDER,transform=ax.transAxes))
fig.savefig(OUT/'stock_report_v3_preview_page2.png',bbox_inches='tight')
plt.close(fig)

# Page 3 preview
fig = plt.figure(figsize=(11.69,8.27),dpi=180)
fig.patch.set_facecolor(BG)
ax = header(fig,'Page 3 — Methodology, Definitions & Data Integrity (v3 Best-of Template)')
ax.add_patch(plt.Rectangle((0.03,0.14),0.94,0.74,facecolor='white',edgecolor=BORDER,transform=ax.transAxes))
ax.add_patch(plt.Rectangle((0.03,0.80),0.94,0.06,facecolor=INDIGO,transform=ax.transAxes))
for i,h in enumerate(['Metric','Definition','Period','Source fields','Fallback rule']):
    fig.text(0.05 + i*0.18,0.82,h,fontsize=9,color='white',weight='bold')
fig.text(0.04,0.18,'Scoring formula block + baseline refresh logic + acronym legend',fontsize=9,color='#4B5563')
fig.savefig(OUT/'stock_report_v3_preview_page3.png',bbox_inches='tight')
plt.close(fig)

print(str(OUT/'stock_report_v3_preview_page1.png'))
print(str(OUT/'stock_report_v3_preview_page2.png'))
print(str(OUT/'stock_report_v3_preview_page3.png'))
