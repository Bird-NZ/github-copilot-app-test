# World Mobile — Canonical Fact Sheet (Phase 2.1)

Last updated: 2026-02-20
Use this as highest-priority retrieval context for fast, consistent answers.

## Confirmed Facts (High confidence)
1. World Mobile Group maintains official GitHub repos for chain metadata and contracts:
   - https://github.com/worldmobilegroup/chains
   - https://github.com/worldmobilegroup/wmt-staking-plutus-smart-contract
   - https://github.com/worldmobilegroup/earthnode-registration-plutus-smart-contract
   - https://github.com/worldmobilegroup/public-docs-and-releases
2. `worldmobilegroup/chains` includes World Mobile Chain mainnet metadata (chainId 869) with published RPC and explorer URL.
3. `explorer.worldmobile.io` exists and identifies as World Mobile Chain explorer.
4. Official testnet faucet endpoint exists: `https://testnet-faucet.worldmobile.net`.

## Confirmed Facts (Medium confidence)
1. `worldmobile.io/the-chain` describes World Mobile Chain as an EVM-compatible L3 built on Base.
2. The same page positions WMTx as native utility/gas token and describes staking modes.
3. EarthNode operations material exists in official docs repo with onboarding/registration/testnet operation flow.

## Environment-Sensitive Facts (must disambiguate before advising)
1. Multiple testnet metadata entries exist in chain metadata; do not assume one default testnet.
2. Token labels/symbols can differ by environment context (e.g., WMTX/WMTx/WOMOX in metadata pages).

## Unknown / Needs Verification Before Stating as Fact
1. Canonical current Aether Node technical definition and production role.
2. Formal network core identity/access/accounting protocol specification.
3. Official API reference endpoints and Unity SDK/package details.
4. Canonical production contract registry list and migration timeline between token representations.

## Answering Rules for this Agent
1. Always label each claim as: Confirmed / Inferred / Unknown.
2. Include source path/URL for all non-trivial claims.
3. If multiple environments are possible, ask a clarification question first.
4. Never provide exact contract addresses unless verified from official source in current session.
