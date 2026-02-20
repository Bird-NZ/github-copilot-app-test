# World Mobile Economic — Phase 2 Token & Staking Verification

- Layer: economic
- Component: wmt_wmtx, staking, reward_engines
- Last Verified: 2026-02-20
- Confidence: medium-high
- Source URL: https://worldmobile.io/the-chain ; https://github.com/worldmobilegroup/wmt-staking-plutus-smart-contract ; https://github.com/worldmobilegroup/earthnode-registration-plutus-smart-contract
- Source Type: official_site + repo

## Summary
Phase 2 verification confirms active staking and registration smart contract repositories, and confirms WMTx positioning as utility/gas token in current public chain messaging.

## Technical Details
- `worldmobile.io/the-chain` states:
  - WMTx is the native utility token for World Mobile Chain.
  - WMTx is used as gas token.
  - Staking modes mentioned: Core Staking and EarthNode Staking.
  - Core staking mentions 30-day epochs and an estimated APY claim (non-guaranteed language included on site).
- `worldmobilegroup/wmt-staking-plutus-smart-contract` README states:
  - Contract allows WMT holders on Cardano to stake to already registered EarthNodes operating on AyA.
- `worldmobilegroup/earthnode-registration-plutus-smart-contract` README states:
  - On-chain EarthNode registration contract exists for Cardano.
  - Registration enables operators to register EarthNode NFTs and operate EarthNodes.

## Dependencies
- Cardano-side staking/registration pathways (AyA + ENNFT registration process)
- WMC token utility (gas/staking/governance) on EVM-side chain

## Risks / Failure Modes
- Dual ecosystem messaging (Cardano-era repos vs current WMC L3 messaging) can cause user confusion without timeline context.
- APY values are variable and should not be treated as guaranteed.

## Open Questions
- Current operational relationship between legacy WMT references and WMTx across environments.
- Formal token migration and canonical token contract addresses by network.
