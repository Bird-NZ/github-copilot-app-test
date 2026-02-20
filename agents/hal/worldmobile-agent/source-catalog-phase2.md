# World Mobile Source Catalog — Phase 2

## A) worldmobilegroup/public-docs-and-releases (GitHub)
URL: https://github.com/worldmobilegroup/public-docs-and-releases
Type: Official organization repo
What information this gives:
1. EarthNode operator documentation exists and is actively structured.
2. EarthNode lifecycle content includes installation, registration, deregistration, and operations.
3. Ayad CLI command surface is documented.
4. Testnet onboarding flow is documented (environment requirements, wallet setup, install/register).

## B) worldmobilegroup/wmt-staking-plutus-smart-contract (GitHub)
URL: https://github.com/worldmobilegroup/wmt-staking-plutus-smart-contract
Type: Official smart contract repo
What information this gives:
1. Staking smart contract codebase exists.
2. README claims WMT holders on Cardano can stake to registered EarthNodes on AyA.
3. Contract instance generation examples and network magic usage are documented.

## C) worldmobilegroup/earthnode-registration-plutus-smart-contract (GitHub)
URL: https://github.com/worldmobilegroup/earthnode-registration-plutus-smart-contract
Type: Official smart contract repo
What information this gives:
1. EarthNode registration smart contract exists (Cardano on-chain code).
2. ENNFT registration for operators is documented.
3. Contract generation and network magic examples are documented.

## D) worldmobilegroup/chains (GitHub)
URL: https://github.com/worldmobilegroup/chains
Type: Official chain metadata repo
What information this gives:
1. WorldMobileChain mainnet metadata entry exists (chainId 869).
2. RPC/explorer endpoints are published for mainnet.
3. Testnet metadata entries exist (e.g., 323432 and 42070).
4. Native currency symbol fields indicate WMTX/WMTx and WOMOX depending on entry.

## E) worldmobile.io/the-chain
URL: https://worldmobile.io/the-chain
Type: Official product/chain page
What information this gives:
1. WMC described as EVM-compatible L3 built on Base.
2. WMTx described as native utility/gas token.
3. Staking modes described (Core staking, EarthNode staking).
4. EarthNode role claims in chain/security/governance context.

## F) explorer.worldmobile.io
URL: https://explorer.worldmobile.io
Type: Official chain explorer endpoint
What information this gives:
1. Confirms public explorer presence for World Mobile Chain.
2. Page title identifies Blockscout-based explorer.

## G) testnet-faucet.worldmobile.net
URL: https://testnet-faucet.worldmobile.net
Type: Official testnet faucet endpoint
What information this gives:
1. Confirms public faucet for test environment.
2. Text references WOMOX test tokens for L3 testnet context.

## Data Quality Notes
- Confidence highest when claim is backed by official org repo file or explicit official page statement.
- Some docs are historical/testnet-oriented; production assertions must be timestamped.
- For unresolved contradictions (multi-testnet entries), mark as "environment-dependent" until canonical recommendation is located.
