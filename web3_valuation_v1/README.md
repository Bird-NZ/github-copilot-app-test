# web3_valuation_v1

Local comps-based valuation pipeline for Web3 domains.

## What it does (v1)
- Ingest your owned domains list
- Build normalized sales comps from raw marketplace exports (`data/raw_sales/*`)
- Quality-score comps (recency, tx hash presence, verification, wash/self-deal/bundle flags)
- Compute pricing bands (quick / realistic / stretch)
- Apply quality-weighted comp adjustment by `tld + category`
- Output scored CSV for listing decisions

## Run

```bash
cd /home/mat/.openclaw/workspace/web3_valuation_v1
source .venv/bin/activate

# optional: fetch live sales into data/raw_sales (Reservoir/OpenSea)
python scripts/fetch_live_sales.py

# optional: verify social signals against on-chain receipts
python scripts/verify_social_sales.py

# optional: rebuild comps only
python scripts/ingest_sales.py

# full valuation pipeline (rebuilds comps automatically)
python scripts/run_pipeline.py

# full pipeline + live connectors + social verification
LIVE_CONNECTORS=1 VERIFY_SOCIAL_SIGNALS=1 python scripts/run_pipeline.py
```

## Inputs
- Owned domains: `data/owned_domains.csv`
- Raw sales sources: `data/raw_sales/*.csv|*.json|*.jsonl`
- UD contract allowlist: `data/ud_contract_allowlist.json`
- Optional social signals input: `data/social_signals.csv`
- Normalized comps output: `data/comps.csv` (auto-generated from raw sales)

### Raw sales field mapping (flexible)
The ingester accepts common aliases, for example:
- domain: `domain`, `name`, `token_name`
- sold price USD: `sold_price_usd`, `price_usd`, `usd_price`, `amount_usd`
- sold date/time: `sold_at`, `sold_date`, `date`, `timestamp`
- tx hash: `tx_hash`, `transaction_hash`, `hash`
- venue: `venue`, `marketplace`, `exchange`

If a source includes only token amount + stablecoin symbol (`USDC`/`USDT`/`DAI`), USD is inferred 1:1.

### Social signals format
`data/social_signals.csv` expected columns:
- `post_id,domain,claimed_price_usd,tx_hash,chain_id,source_url,author,posted_at`

Only rows with on-chain receipts touching UD allowlist contracts are promoted to comps.

## Live connectors
Supported connectors:
- Reservoir sales API (`/sales/v6`)
- OpenSea v2 events API

Environment variables:
- `LIVE_CONNECTORS=1` (force live fetch in `run_pipeline.py`)
- `LIVE_SALES_LIMIT=200` (default)
- `RESERVOIR_API_BASE` (optional)
- `RESERVOIR_API_KEY` (optional)
- `RESERVOIR_COLLECTION` (optional)
- `OPENSEA_API_KEY` (recommended)
- `OPENSEA_COLLECTION` (optional)

## Outputs
- `outputs/domain_valuations.csv`
- `outputs/top100_listing_candidates.csv`
- `outputs/summary.json`

## Next upgrades
- Wire real comps sources (NameBio/API/marketplace exports)
- Add confidence model from comp density + recency
- Add sell-through estimates by TLD/category
