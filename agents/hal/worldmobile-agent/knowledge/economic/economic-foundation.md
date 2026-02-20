# World Mobile Economic Layer — Initial Verified Pack

- Layer: economic
- Component: wmt_wmtx, staking, reward_engines, billing_connectors
- Last Verified: 2026-02-20
- Confidence: medium
- Source URL: https://worldmobile.io ; https://docs.worldmobile.io
- Source Type: official_docs

## Summary
Public sources describe token-based rewards and explicitly mention staking by EarthNode operators to strengthen the network and unlock greater rewards.

## Technical Details
- Main site positions participation as reward-bearing for network operators.
- Main site states EarthNode operators process telco data and stake World Mobile Tokens.
- Docs describe a sharing-economy model that rewards node operators.

## Dependencies
- Chain-based settlement/reward contracts
- Network accounting events
- Operator performance and policy rules

## Risks / Failure Modes
- Tokenomics parameters and formulas are not yet captured from up-to-date primary tokenomics docs.
- Potential mismatch between promotional summary and current on-chain implementation.

## Open Questions
- Current distinction and lifecycle between WMT and WMTx.
- Reward formula, epochs, slashing/penalty logic (if any).
- Billing connector architecture and fiat/telecom settlement interfaces.
