#!/usr/bin/env python3
"""Verify social sale signals against on-chain transaction receipts.

Input:
- data/social_signals.csv with columns such as:
  post_id,domain,claimed_price_usd,tx_hash,chain_id,source_url,author,posted_at

Output:
- data/raw_sales/social_verified.jsonl (only verified rows)
- data/social_signals_verified.csv (all rows with verification status)
"""

from __future__ import annotations

import csv
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path('/home/mat/.openclaw/workspace/web3_valuation_v1')
DATA = ROOT / 'data'
RAW = DATA / 'raw_sales'
SIGNALS = DATA / 'social_signals.csv'
ALLOWLIST = DATA / 'ud_contract_allowlist.json'
VERIFIED_JSONL = RAW / 'social_verified.jsonl'
VERIFIED_CSV = DATA / 'social_signals_verified.csv'


def _rpc_url(chain_id: str) -> str:
    chain_id = str(chain_id or '').strip()
    if chain_id == '1':
        return os.getenv('ETH_RPC_URL', '')
    if chain_id == '137':
        return os.getenv('POLYGON_RPC_URL', '')
    return ''


def _post_json(url: str, payload: dict) -> dict:
    req = Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    with urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _load_allowlist() -> dict[str, set[str]]:
    if not ALLOWLIST.exists():
        return {}
    data = json.loads(ALLOWLIST.read_text(encoding='utf-8'))
    out: dict[str, set[str]] = {}
    for cid, cfg in data.get('chains', {}).items():
        vals = cfg.get('contracts', {}).values()
        out[str(cid)] = {str(v).lower() for v in vals if isinstance(v, str) and v.startswith('0x')}
    return out


def _iter_verified_contracts_from_receipt(receipt: dict) -> set[str]:
    c = set()
    to_addr = receipt.get('to')
    if isinstance(to_addr, str) and to_addr.startswith('0x'):
        c.add(to_addr.lower())
    for log in receipt.get('logs', []) or []:
        addr = log.get('address')
        if isinstance(addr, str) and addr.startswith('0x'):
            c.add(addr.lower())
    return c


def verify_signals() -> dict:
    RAW.mkdir(parents=True, exist_ok=True)
    allow = _load_allowlist()

    if not SIGNALS.exists():
        return {'ok': True, 'verified': 0, 'processed': 0, 'note': 'no social_signals.csv present'}

    rows = []
    verified_rows = []

    with open(SIGNALS, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            row = dict(r)
            chain_id = str(row.get('chain_id') or '').strip() or '137'
            tx_hash = str(row.get('tx_hash') or '').strip().lower()
            rpc = _rpc_url(chain_id)

            status = 'unverified'
            reason = ''
            hit_contract = ''

            if not tx_hash.startswith('0x'):
                reason = 'missing_tx_hash'
            elif not rpc:
                reason = 'missing_rpc_url'
            else:
                try:
                    payload = {'jsonrpc': '2.0', 'id': 1, 'method': 'eth_getTransactionReceipt', 'params': [tx_hash]}
                    receipt = _post_json(rpc, payload).get('result')
                    if not receipt:
                        reason = 'receipt_not_found'
                    else:
                        seen = _iter_verified_contracts_from_receipt(receipt)
                        allowed = allow.get(chain_id, set())
                        matches = sorted(seen.intersection(allowed)) if allowed else []
                        if matches:
                            status = 'verified_sale'
                            hit_contract = matches[0]
                        else:
                            reason = 'no_ud_allowlist_contract_in_receipt'
                except Exception as e:
                    reason = f'rpc_error:{e}'

            row['verification_status'] = status
            row['verification_reason'] = reason
            row['matched_contract'] = hit_contract
            rows.append(row)

            if status == 'verified_sale':
                verified_rows.append({
                    'domain': row.get('domain', ''),
                    'sold_price_usd': row.get('claimed_price_usd', ''),
                    'sold_date': row.get('posted_at', ''),
                    'sold_at': row.get('posted_at', ''),
                    'venue': 'social_verified',
                    'tx_hash': tx_hash,
                    'verified': True,
                    'source': 'twitter_signal',
                    'chain_id': chain_id,
                    'contract_address': hit_contract,
                })

    if rows:
        with open(VERIFIED_CSV, 'w', newline='', encoding='utf-8') as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)

    with open(VERIFIED_JSONL, 'w', encoding='utf-8') as f:
        for r in verified_rows:
            f.write(json.dumps(r) + '\n')

    return {'ok': True, 'processed': len(rows), 'verified': len(verified_rows), 'out_jsonl': str(VERIFIED_JSONL)}


def main() -> None:
    print(json.dumps(verify_signals(), indent=2))


if __name__ == '__main__':
    main()
