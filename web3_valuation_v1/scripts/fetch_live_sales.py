#!/usr/bin/env python3
"""Fetch live domain sale events from supported APIs into data/raw_sales.

Connectors:
- Reservoir (NFT sales)
- OpenSea v2 events

Auth is optional for Reservoir and usually required for OpenSea.
Set environment variables:
- RESERVOIR_API_BASE (optional, default: https://api.reservoir.tools)
- RESERVOIR_API_KEY (optional)
- RESERVOIR_COLLECTION (optional; contract or slug depending endpoint support)
- OPENSEA_API_KEY (optional)
- OPENSEA_COLLECTION (optional; slug)
- LIVE_SALES_LIMIT (optional, default 200)
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path('/home/mat/.openclaw/workspace/web3_valuation_v1')
RAW = ROOT / 'data' / 'raw_sales'


def _get_json(url: str, headers: dict[str, str] | None = None, timeout: int = 30) -> dict:
    req = Request(url, headers=headers or {})
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')


def fetch_reservoir_sales(limit: int = 200) -> tuple[str, int]:
    base = os.getenv('RESERVOIR_API_BASE', 'https://api.reservoir.tools').rstrip('/')
    api_key = os.getenv('RESERVOIR_API_KEY', '')
    collection = os.getenv('RESERVOIR_COLLECTION', '')

    headers = {'accept': '*/*'}
    if api_key:
        headers['x-api-key'] = api_key

    rows: list[dict] = []
    continuation = None
    remaining = max(1, limit)

    while remaining > 0:
        page_size = min(100, remaining)
        params = {'limit': page_size}
        if continuation:
            params['continuation'] = continuation
        if collection:
            params['collection'] = collection

        url = f"{base}/sales/v6?{urlencode(params)}"
        payload = _get_json(url, headers=headers)
        sales = payload.get('sales', [])
        rows.extend(sales)

        continuation = payload.get('continuation')
        remaining -= len(sales)
        if not continuation or not sales:
            break

    out_path = RAW / 'reservoir_sales.jsonl'
    _write_jsonl(out_path, rows)
    return str(out_path), len(rows)


def fetch_opensea_events(limit: int = 200) -> tuple[str, int]:
    api_key = os.getenv('OPENSEA_API_KEY', '')
    collection = os.getenv('OPENSEA_COLLECTION', '')

    # OpenSea v2 events endpoint supports nft.sales event_type.
    # Docs/behavior may vary by account tier.
    base = 'https://api.opensea.io/api/v2/events'

    headers = {'accept': 'application/json'}
    if api_key:
        headers['x-api-key'] = api_key

    next_cursor = None
    remaining = max(1, limit)
    rows: list[dict] = []

    while remaining > 0:
        page_size = min(50, remaining)
        params = {
            'event_type': 'sale',
            'limit': page_size,
        }
        if collection:
            params['collection_slug'] = collection
        if next_cursor:
            params['next'] = next_cursor

        url = f"{base}?{urlencode(params)}"
        payload = _get_json(url, headers=headers)
        events = payload.get('asset_events', []) or payload.get('events', [])
        rows.extend(events)

        next_cursor = payload.get('next')
        remaining -= len(events)
        if not next_cursor or not events:
            break

    out_path = RAW / 'opensea_sales.jsonl'
    _write_jsonl(out_path, rows)
    return str(out_path), len(rows)


def run_live_fetch(limit: int | None = None) -> dict:
    limit = limit or int(os.getenv('LIVE_SALES_LIMIT', '200'))
    started = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    results = {
        'started_at': started,
        'limit': limit,
        'connectors': {},
        'errors': {},
    }

    try:
        path, n = fetch_reservoir_sales(limit=limit)
        results['connectors']['reservoir'] = {'rows': n, 'path': path}
    except Exception as e:
        results['errors']['reservoir'] = str(e)

    try:
        path, n = fetch_opensea_events(limit=limit)
        results['connectors']['opensea'] = {'rows': n, 'path': path}
    except Exception as e:
        results['errors']['opensea'] = str(e)

    return results


def main() -> None:
    out = run_live_fetch()
    print(json.dumps(out, indent=2))


if __name__ == '__main__':
    main()
