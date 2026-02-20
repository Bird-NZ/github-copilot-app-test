# World Mobile Physical/Operations — Phase 2 EarthNode Ops Verification

- Layer: physical
- Component: earth_nodes
- Last Verified: 2026-02-20
- Confidence: medium-high
- Source URL: https://github.com/worldmobilegroup/public-docs-and-releases ; https://docs.worldmobile.io ; https://worldmobile.io
- Source Type: repo + official_docs + official_site

## Summary
Phase 2 confirms a publicly maintained EarthNode documentation repo with operational and testnet runbook content, including installation, registration, and CLI operations.

## Technical Details
From `worldmobilegroup/public-docs-and-releases`:
- EarthNode docs include sections for:
  - Joining testnet
  - Installation and registration
  - Deregistration
  - Cardano chain follower configuration
  - CLI quick reference (`ayad`)
- `Register EarthNode and Become a Validator` guide includes registration workflow via EarthNode Registration Manager and transaction verification via Cardano explorer.
- `Ayad CLI quick reference` lists command surfaces (init, query, keys, gentx, etc.), indicating validator operations tooling.

## Dependencies
- Wallet tooling and transaction signing
- Registration manager workflow
- Chain sync dependencies and environment requirements

## Risks / Failure Modes
- Some docs sections are marked draft or evolving.
- Testnet process details may not map 1:1 to current mainnet operations.

## Open Questions
- Current AirNode and Aether Node equivalent operational runbooks.
- Latest production hardware requirements and SLA expectations.
