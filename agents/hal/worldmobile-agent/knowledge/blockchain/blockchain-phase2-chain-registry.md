# World Mobile Blockchain — Phase 2 Chain Registry Verification

- Layer: blockchain
- Component: world_mobile_chain, explorers
- Last Verified: 2026-02-20
- Confidence: high
- Source URL: https://github.com/worldmobilegroup/chains ; https://explorer.worldmobile.io ; https://worldmobile.io/the-chain
- Source Type: repo + official_site

## Summary
World Mobile Group publishes a chain metadata repository containing explicit World Mobile Chain entries, including chain IDs, RPC endpoints, explorer URLs, and native currency symbols.

## Technical Details
From `worldmobilegroup/chains`:
- Mainnet metadata file `eip155-869.json`:
  - name: `WorldMobileChain-Mainnet`
  - chainId/networkId: `869`
  - shortName: `WMC`
  - RPC: `https://worldmobilechain-mainnet.g.alchemy.com/public`
  - explorer: `https://explorer.worldmobile.io`
  - nativeCurrency symbol: `WMTX`
- Testnet metadata file `eip155-323432.json`:
  - name: `World Mobile Chain Testnet`
  - chainId/networkId: `323432`
  - shortName: `WMCTEST`
  - RPC: `https://worldmobile-devnet.g.alchemy.com/public`
  - faucet: `https://testnet-faucet.worldmobile.net`
  - explorer: `https://testnet-explorer.worldmobile.net`
  - nativeCurrency symbol: `WOMOX`
- Additional WMC testnet metadata `eip155-42070.json`:
  - chainId/networkId: `42070`
  - RPC: `https://rpc-testnet-base.worldmobile.net`
  - faucet: `https://faucet-testnet-base.worldmobile.net`
  - explorer: `https://explorer-testnet-base.worldmobile.net`
  - nativeCurrency symbol: `WMTx`

Cross-checks:
- `explorer.worldmobile.io` page title identifies it as World Mobile Chain explorer (Blockscout).
- `worldmobile.io/the-chain` describes WMC as EVM-compatible L3 built on Base.

## Dependencies
- RPC provider availability
- Explorer infrastructure
- Token metadata consistency across networks

## Risks / Failure Modes
- Network metadata can change; endpoints must be periodically revalidated.
- Presence of multiple testnet entries may create confusion unless environment is explicitly selected.

## Open Questions
- Canonical recommendation from World Mobile on which testnet (323432 vs 42070) is current primary.
- Contract registry source of truth for production deployments.
