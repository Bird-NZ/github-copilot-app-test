#!/usr/bin/env python3
import json
import os
from pathlib import Path
from datetime import datetime, timezone
import pandas as pd

from ingest_sales import build_comps_from_sources
from fetch_live_sales import run_live_fetch
from verify_social_sales import verify_signals

ROOT = Path('/home/mat/.openclaw/workspace/web3_valuation_v1')
DATA = ROOT / 'data'
OUT = ROOT / 'outputs'
OUT.mkdir(parents=True, exist_ok=True)

OWNED_SRC = Path('/home/mat/.openclaw/workspace/agents/hal/data/web3_domains/domains_rows.csv')
OWNED = DATA / 'owned_domains.csv'
COMPS = DATA / 'comps.csv'

MODEL_VERSION = '1.1'


def ensure_inputs():
    live_fetch = None
    social_verify = None
    if not OWNED.exists():
        if OWNED_SRC.exists():
            src = pd.read_csv(OWNED_SRC)
            df = pd.DataFrame({'domain': src['domain'].astype(str).str.lower().str.strip()})
            df = df.drop_duplicates().reset_index(drop=True)
            df['tld'] = df['domain'].str.split('.').str[-1]
            df['label'] = df['domain'].str.rsplit('.', n=1).str[0]
            df.to_csv(OWNED, index=False)
        else:
            raise SystemExit('No owned domains source found')

    if os.getenv('LIVE_CONNECTORS') == '1' or os.getenv('RESERVOIR_API_KEY') or os.getenv('OPENSEA_API_KEY'):
        live_fetch = run_live_fetch()

    if os.getenv('VERIFY_SOCIAL_SIGNALS', '1') == '1':
        social_verify = verify_signals()

    build_comps_from_sources(write_file=True)

    if not COMPS.exists():
        cols = [
            'domain', 'tld', 'label', 'sold_price', 'sold_currency', 'sold_price_usd', 'sold_at',
            'sold_date', 'venue', 'tx_hash', 'buyer', 'seller', 'bundle_flag', 'self_deal_flag',
            'wash_trade_flag', 'verified', 'source', 'source_confidence', 'chain_id', 'contract_address', 'quality_score'
        ]
        pd.DataFrame(columns=cols).to_csv(COMPS, index=False)

    return live_fetch, social_verify


def classify(label: str) -> str:
    s = label.lower()
    if any(k in s for k in ['bank', 'fund', 'pay', 'invest', 'capital', 'forex', 'money']):
        return 'finance'
    if any(k in s for k in ['bet', 'casino', 'lotto', 'poker', 'racing', 'jackpot', 'spin', 'wager']):
        return 'gaming'
    if any(k in s for k in ['bitcoin', 'crypto', 'blockchain', 'dao', 'nft', 'polygon', 'ordinal', 'taproot']):
        return 'web3'
    if len(label) <= 6:
        return 'short'
    return 'general'


def build_tld_multiplier_model(df_comps: pd.DataFrame):
    # Prior multipliers from legacy v1 bases, normalized around 1.0.
    prior_base = {
        'crypto': 700,
        'wallet': 650,
        'bitcoin': 600,
        'nft': 300,
        'dao': 280,
        'blockchain': 260,
        'zil': 120,
        'x': 180,
        '888': 150,
        'polygon': 220,
        'go': 160,
    }
    neutral_base = 180.0
    prior_mult = {k: v / neutral_base for k, v in prior_base.items()}

    c = df_comps.copy()
    c['tld'] = c.get('tld', '').astype(str).str.lower()
    c = c[pd.to_numeric(c.get('sold_price_usd'), errors='coerce').notna()].copy()
    c['sold_price_usd'] = c['sold_price_usd'].astype(float)

    if 'quality_score' not in c.columns:
        c['quality_score'] = 0.6
    c['quality_score'] = pd.to_numeric(c['quality_score'], errors='coerce').fillna(0.6).clip(0.0, 1.0)

    # Global evidence level controls how much prior is allowed to influence prices.
    total_evidence = float(c['quality_score'].sum())
    prior_strength = total_evidence / (total_evidence + 60.0)  # 0 when no comps, ->1 with strong evidence

    # Shrink priors toward 1 when evidence is sparse.
    shrunken_prior = {k: 1.0 + (m - 1.0) * prior_strength for k, m in prior_mult.items()}

    if c.empty:
        return shrunken_prior, {
            'total_evidence': round(total_evidence, 3),
            'prior_strength': round(prior_strength, 3),
            'global_median': None,
        }

    global_median = float(c['sold_price_usd'].median())
    alpha = 12.0  # empirical Bayes smoothing for per-TLD evidence

    tld_stats = (
        c.groupby('tld')
        .apply(lambda g: pd.Series({
            'n': len(g),
            'w': float(g['quality_score'].sum()),
            'median': float(g['sold_price_usd'].median()),
        }))
        .reset_index()
    )

    mult = dict(shrunken_prior)
    for _, r in tld_stats.iterrows():
        tld = str(r['tld'])
        if not tld or global_median <= 0:
            continue
        observed = max(0.2, min(5.0, float(r['median']) / global_median))
        w = float(r['w'])
        obs_strength = w / (w + alpha)
        prior = shrunken_prior.get(tld, 1.0)
        posterior = (prior * (1.0 - obs_strength)) + (observed * obs_strength)
        mult[tld] = max(0.5, min(3.5, posterior))

    return mult, {
        'total_evidence': round(total_evidence, 3),
        'prior_strength': round(prior_strength, 3),
        'global_median': round(global_median, 2),
    }


def base_price_row(row, tld_mult: dict[str, float]):
    label = row['label']
    tld = row['tld']
    n = len(label)

    base = 180.0 * float(tld_mult.get(tld, 1.0))

    if n <= 3:
        lm = 2.5
    elif n <= 5:
        lm = 1.8
    elif n <= 8:
        lm = 1.2
    elif n <= 12:
        lm = 1.0
    else:
        lm = 0.8

    cat = classify(label)
    cm = {'finance': 1.35, 'gaming': 1.25, 'web3': 1.15, 'short': 1.20, 'general': 1.0}[cat]

    realistic = round(base * lm * cm, 0)
    quick = round(realistic * 0.65, 0)
    stretch = round(realistic * 1.8, 0)

    conf = 0.35
    if n <= 6:
        conf += 0.2
    if cat in ('finance', 'gaming'):
        conf += 0.15
    # small premium confidence for historically liquid namespaces, but bounded
    if tld in ('crypto', 'wallet', 'bitcoin'):
        conf += 0.06
    conf = min(conf, 0.85)

    return quick, realistic, stretch, cat, conf


def apply_comps_adjustment(df_owned, df_comps):
    if df_comps.empty:
        return df_owned

    df = df_owned.copy()
    c = df_comps.copy()
    c['tld'] = c['tld'].astype(str).str.lower()
    c['label'] = c['label'].astype(str)
    c['category'] = c['label'].apply(classify)
    c = c[pd.to_numeric(c['sold_price_usd'], errors='coerce').notna()]
    c['sold_price_usd'] = c['sold_price_usd'].astype(float)

    if 'quality_score' not in c.columns:
        c['quality_score'] = 0.6
    c['quality_score'] = pd.to_numeric(c['quality_score'], errors='coerce').fillna(0.6).clip(0.0, 1.0)

    c['sold_at'] = pd.to_datetime(c.get('sold_at', c.get('sold_date')), utc=True, errors='coerce')
    now = pd.Timestamp.now(tz='UTC')
    age_days = (now - c['sold_at']).dt.days
    c['recency_weight'] = 0.7
    c.loc[age_days <= 365, 'recency_weight'] = 0.9
    c.loc[age_days <= 90, 'recency_weight'] = 1.1
    c['comp_weight'] = (c['quality_score'] * c['recency_weight']).clip(0.1, 1.25)

    agg = (
        c.groupby(['tld', 'category'])
        .apply(lambda g: pd.Series({
            'weighted_price': (g['sold_price_usd'] * g['comp_weight']).sum() / max(g['comp_weight'].sum(), 1e-9),
            'comp_count': len(g),
        }))
        .reset_index()
    )
    stats = {(r['tld'], r['category']): (r['weighted_price'], int(r['comp_count'])) for _, r in agg.iterrows()}

    adj, counts = [], []
    for _, r in df.iterrows():
        key = (r['tld'], r['category'])
        if key in stats and stats[key][0] > 0:
            weighted_price, comp_count = stats[key]
            ratio = weighted_price / max(r['realistic_usd'], 1)
            ratio = max(0.6, min(ratio, 2.5))
            counts.append(comp_count)
        else:
            ratio = 1.0
            counts.append(0)
        adj.append(ratio)

    df['comp_adj_ratio'] = adj
    df['comp_count'] = counts
    for col in ['quick_usd', 'realistic_usd', 'stretch_usd']:
        df[col] = (df[col] * df['comp_adj_ratio']).round(0)

    density_bonus = (df['comp_count'].clip(upper=5) * 0.02)
    applied_bonus = (df['comp_adj_ratio'] != 1.0).astype(float) * 0.06
    df['confidence'] = (df['confidence'] + density_bonus + applied_bonus).clip(upper=0.97)
    return df


def main():
    live_fetch, social_verify = ensure_inputs()
    owned = pd.read_csv(OWNED)
    comps = pd.read_csv(COMPS)

    owned['domain'] = owned['domain'].astype(str).str.lower().str.strip()
    owned = owned[owned['domain'].str.contains(r'\.')].copy()
    owned['tld'] = owned['domain'].str.split('.').str[-1]
    owned['label'] = owned['domain'].str.rsplit('.', n=1).str[0]

    tld_mult, tld_model_stats = build_tld_multiplier_model(comps)

    vals = owned.apply(lambda r: base_price_row(r, tld_mult), axis=1, result_type='expand')
    vals.columns = ['quick_usd', 'realistic_usd', 'stretch_usd', 'category', 'confidence']
    out = pd.concat([owned, vals], axis=1)

    out = apply_comps_adjustment(out, comps)

    out['listing_score'] = (
        (out['realistic_usd'] * 0.5)
        + ((out['stretch_usd'] - out['quick_usd']) * 0.2)
        + (out['confidence'] * 300)
        - (out['label'].str.len() * 3)
    )

    out = out.sort_values('listing_score', ascending=False).reset_index(drop=True)

    out_path = OUT / 'domain_valuations.csv'
    top_path = OUT / 'top100_listing_candidates.csv'
    out.to_csv(out_path, index=False)
    out.head(100).to_csv(top_path, index=False)

    top100_tld_mix = out.head(100)['tld'].value_counts().to_dict()

    summary = {
        'generated_at': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'model_version': MODEL_VERSION,
        'owned_domains': int(len(out)),
        'comps_rows': int(len(comps)),
        'comps_median_quality': float(pd.to_numeric(comps.get('quality_score'), errors='coerce').dropna().median()) if 'quality_score' in comps.columns and len(comps) else None,
        'tld_counts': out['tld'].value_counts().head(12).to_dict(),
        'top100_tld_mix': top100_tld_mix,
        'median_realistic_usd': float(out['realistic_usd'].median()),
        'median_quick_usd': float(out['quick_usd'].median()),
        'median_stretch_usd': float(out['stretch_usd'].median()),
        'tld_model_stats': tld_model_stats,
        'live_fetch': live_fetch,
        'social_verify': social_verify,
        'note': 'v1.1 evidence-weighted TLD model: priors are automatically shrunk when comps are sparse.'
    }
    with open(OUT / 'summary.json', 'w') as f:
        json.dump(summary, f, indent=2)

    print('OK')
    print(out_path)
    print(top_path)
    print(OUT / 'summary.json')


if __name__ == '__main__':
    main()
