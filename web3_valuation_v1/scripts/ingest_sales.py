#!/usr/bin/env python3
"""Build normalized comps from raw marketplace/export sales files.

Supported inputs (auto-discovered under data/raw_sales):
- CSV files (*.csv)
- JSON Lines files (*.jsonl)
- JSON arrays (*.json)

Source adapters are intentionally lightweight and resilient.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any
import json

import pandas as pd

ROOT = Path('/home/mat/.openclaw/workspace/web3_valuation_v1')
DATA = ROOT / 'data'
RAW = DATA / 'raw_sales'
COMPS = DATA / 'comps.csv'
ALLOWLIST = DATA / 'ud_contract_allowlist.json'


@dataclass
class SourceFrame:
    name: str
    frame: pd.DataFrame
    source_confidence: float


def _first_existing(d: dict[str, Any], keys: list[str], default: Any = None) -> Any:
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return default


def _normalize_domain(v: Any) -> str:
    return str(v or '').strip().lower()


def _to_bool(v: Any) -> bool:
    if isinstance(v, bool):
        return v
    return str(v or '').strip().lower() in {'1', 'true', 'yes', 'y', 't'}


def _to_float(v: Any) -> float | None:
    if v is None:
        return None
    try:
        return float(v)
    except Exception:
        return None


def _load_allowlist() -> dict[str, set[str]]:
    if not ALLOWLIST.exists():
        return {}
    data = json.loads(ALLOWLIST.read_text(encoding='utf-8'))
    out: dict[str, set[str]] = {}
    for cid, cfg in data.get('chains', {}).items():
        vals = cfg.get('contracts', {}).values()
        out[str(cid)] = {str(v).lower() for v in vals if isinstance(v, str) and v.startswith('0x')}
    return out


def _map_record(record: dict[str, Any], source_name: str, source_confidence: float) -> dict[str, Any]:
    # Generic aliases.
    domain = _normalize_domain(_first_existing(record, ['domain', 'name', 'token_name', 'asset_name']))

    # Reservoir-style nested objects.
    token = record.get('token') if isinstance(record.get('token'), dict) else {}
    if not domain:
        domain = _normalize_domain(_first_existing(token, ['name']))

    price = record.get('price') if isinstance(record.get('price'), dict) else {}
    price_amount = price.get('amount') if isinstance(price.get('amount'), dict) else {}
    price_currency = price.get('currency') if isinstance(price.get('currency'), dict) else {}

    sold_price = _to_float(_first_existing(record, ['sold_price', 'price', 'amount', 'value']))
    if sold_price is None:
        sold_price = _to_float(_first_existing(price_amount, ['native']))

    sold_currency = str(_first_existing(record, ['sold_currency', 'currency', 'payment_token', 'token_symbol'], '') or '').upper()
    if not sold_currency:
        sold_currency = str(_first_existing(price_currency, ['symbol'], '') or '').upper()

    sold_price_usd = _to_float(_first_existing(record, ['sold_price_usd', 'price_usd', 'usd_price', 'amount_usd']))
    if sold_price_usd is None:
        sold_price_usd = _to_float(_first_existing(price_amount, ['usd']))

    # OpenSea-style nested objects.
    nft = record.get('nft') if isinstance(record.get('nft'), dict) else {}
    if not domain:
        domain = _normalize_domain(_first_existing(nft, ['name']))

    contract_address = str(_first_existing(record, ['contract_address', 'token_contract', 'asset_contract_address'], '') or '').strip().lower()
    if not contract_address:
        contract_address = str(_first_existing(token, ['contract'], '') or '').strip().lower()
    if not contract_address:
        contract_address = str(_first_existing(nft, ['contract'], '') or '').strip().lower()

    chain_id = str(_first_existing(record, ['chain_id', 'chainId'], '') or '').strip()
    if not chain_id:
        chain_obj = record.get('chain') if isinstance(record.get('chain'), dict) else {}
        chain_id = str(_first_existing(chain_obj, ['id'], '') or '').strip()

    payment = record.get('payment') if isinstance(record.get('payment'), dict) else {}
    quantity = _to_float(_first_existing(payment, ['quantity']))
    decimals = _to_float(_first_existing(payment, ['decimals']))
    if sold_price is None and quantity is not None:
        sold_price = quantity / (10 ** int(decimals or 0))
    if not sold_currency:
        sold_currency = str(_first_existing(payment, ['symbol', 'token_symbol'], '') or '').upper()

    payment_usd = _to_float(_first_existing(payment, ['quantity_usd', 'usd_price']))
    if sold_price_usd is None and payment_usd is not None:
        sold_price_usd = payment_usd

    if sold_price_usd is None and sold_price is not None and sold_currency in {'USD', 'USDC', 'USDT', 'DAI'}:
        sold_price_usd = sold_price

    tld = domain.split('.')[-1] if '.' in domain else ''
    label = domain.rsplit('.', 1)[0] if '.' in domain else domain

    sold_at = _first_existing(record, ['sold_at', 'sold_date', 'date', 'timestamp', 'time', 'event_timestamp'])
    sold_at = pd.to_datetime(sold_at, utc=True, errors='coerce')

    venue = str(_first_existing(record, ['venue', 'marketplace', 'exchange', 'platform'], source_name) or source_name)
    tx_hash = str(_first_existing(record, ['tx_hash', 'transaction_hash', 'hash'], '') or '').strip().lower()
    if not tx_hash:
        txn = record.get('transaction') if isinstance(record.get('transaction'), dict) else {}
        tx_hash = str(_first_existing(txn, ['hash'], '') or '').strip().lower()

    buyer = str(_first_existing(record, ['buyer', 'to', 'to_address'], '') or '').strip().lower()
    if not buyer:
        to_acct = record.get('to_account') if isinstance(record.get('to_account'), dict) else {}
        buyer = str(_first_existing(to_acct, ['address'], '') or '').strip().lower()

    seller = str(_first_existing(record, ['seller', 'from', 'from_address'], '') or '').strip().lower()
    if not seller:
        from_acct = record.get('from_account') if isinstance(record.get('from_account'), dict) else {}
        seller = str(_first_existing(from_acct, ['address'], '') or '').strip().lower()

    bundle_flag = _to_bool(_first_existing(record, ['bundle_flag', 'is_bundle', 'bundle'], False))
    self_deal_flag = buyer != '' and seller != '' and buyer == seller
    wash_trade_flag = _to_bool(_first_existing(record, ['wash_trade_flag', 'is_wash_trade'], False)) or self_deal_flag
    verified = _to_bool(_first_existing(record, ['verified', 'tx_verified'], bool(tx_hash)))

    return {
        'domain': domain,
        'tld': tld,
        'label': label,
        'sold_price': sold_price,
        'sold_currency': sold_currency,
        'sold_price_usd': sold_price_usd,
        'sold_at': sold_at,
        'sold_date': sold_at.isoformat().replace('+00:00', 'Z') if pd.notna(sold_at) else '',
        'venue': venue,
        'tx_hash': tx_hash,
        'buyer': buyer,
        'seller': seller,
        'bundle_flag': bundle_flag,
        'self_deal_flag': self_deal_flag,
        'wash_trade_flag': wash_trade_flag,
        'verified': verified,
        'source': source_name,
        'source_confidence': source_confidence,
        'chain_id': chain_id,
        'contract_address': contract_address,
    }


def _read_source_file(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == '.csv':
        return pd.read_csv(path)
    if path.suffix.lower() == '.jsonl':
        return pd.read_json(path, lines=True)
    if path.suffix.lower() == '.json':
        return pd.read_json(path)
    raise ValueError(f'Unsupported file type: {path}')


def discover_sources() -> list[SourceFrame]:
    RAW.mkdir(parents=True, exist_ok=True)
    sources: list[SourceFrame] = []

    for path in sorted(RAW.glob('*')):
        if not path.is_file() or path.suffix.lower() not in {'.csv', '.jsonl', '.json'}:
            continue
        df = _read_source_file(path)
        cols = {str(c).lower() for c in df.columns}
        has_tx = {'tx_hash', 'transaction_hash', 'hash'} & cols
        conf = 0.65 if has_tx else 0.55
        sources.append(SourceFrame(name=path.stem, frame=df, source_confidence=conf))

    return sources


def compute_quality_score(df: pd.DataFrame) -> pd.Series:
    now = pd.Timestamp.now(tz='UTC')
    sold_at = pd.to_datetime(df['sold_at'], utc=True, errors='coerce')
    age_days = (now - sold_at).dt.days

    recency_bonus = pd.Series(0.0, index=df.index)
    recency_bonus = recency_bonus.mask(age_days <= 365, 0.05)
    recency_bonus = recency_bonus.mask(age_days <= 90, 0.1)

    tx_bonus = (df['tx_hash'].astype(str).str.len() > 0).astype(float) * 0.1
    verified_bonus = df['verified'].astype(bool).astype(float) * 0.1

    bundle_penalty = df['bundle_flag'].astype(bool).astype(float) * 0.15
    self_penalty = df['self_deal_flag'].astype(bool).astype(float) * 0.25
    wash_penalty = df['wash_trade_flag'].astype(bool).astype(float) * 0.3

    score = (
        df['source_confidence'].fillna(0.5).astype(float)
        + recency_bonus
        + tx_bonus
        + verified_bonus
        - bundle_penalty
        - self_penalty
        - wash_penalty
    )
    return score.clip(lower=0.0, upper=1.0).round(3)


def build_comps_from_sources(write_file: bool = True) -> pd.DataFrame:
    sources = discover_sources()
    rows: list[dict[str, Any]] = []
    allow = _load_allowlist()

    for src in sources:
        for rec in src.frame.to_dict(orient='records'):
            mapped = _map_record(rec, source_name=src.name, source_confidence=src.source_confidence)
            if not mapped['domain'] or '.' not in mapped['domain']:
                continue
            if mapped['sold_price_usd'] is None or mapped['sold_price_usd'] <= 0:
                continue

            contract = str(mapped.get('contract_address') or '').lower()
            chain_id = str(mapped.get('chain_id') or '')
            if contract and chain_id in allow and contract not in allow.get(chain_id, set()):
                continue

            rows.append(mapped)

    cols = [
        'domain', 'tld', 'label', 'sold_price', 'sold_currency', 'sold_price_usd',
        'sold_at', 'sold_date', 'venue', 'tx_hash', 'buyer', 'seller',
        'bundle_flag', 'self_deal_flag', 'wash_trade_flag', 'verified',
        'source', 'source_confidence', 'chain_id', 'contract_address', 'quality_score'
    ]

    if not rows:
        empty = pd.DataFrame(columns=cols)
        if write_file:
            empty.to_csv(COMPS, index=False)
        return empty

    out = pd.DataFrame(rows)
    out['quality_score'] = compute_quality_score(out)

    out = out.sort_values(['quality_score', 'sold_at'], ascending=[False, False])
    with_hash = out[out['tx_hash'].astype(str).str.len() > 0].drop_duplicates(subset=['tx_hash', 'domain'], keep='first')
    no_hash = out[out['tx_hash'].astype(str).str.len() == 0].drop_duplicates(
        subset=['domain', 'sold_date', 'sold_price_usd'], keep='first'
    )
    out = pd.concat([with_hash, no_hash], ignore_index=True)
    out = out.sort_values('sold_at', ascending=False).reset_index(drop=True)
    out = out[cols]

    if write_file:
        COMPS.parent.mkdir(parents=True, exist_ok=True)
        out.to_csv(COMPS, index=False)

    return out


def main() -> None:
    out = build_comps_from_sources(write_file=True)
    print(f'OK {len(out)} normalized sales -> {COMPS}')


if __name__ == '__main__':
    main()
