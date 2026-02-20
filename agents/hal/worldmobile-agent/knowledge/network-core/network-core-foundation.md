# World Mobile Network Core — Initial Verified Pack

- Layer: network_core
- Component: identity_system, access_control, accounting_engine
- Last Verified: 2026-02-20
- Confidence: medium
- Source URL: https://docs.worldmobile.io
- Source Type: official_docs

## Summary
World Mobile documentation states the network is privacy-first and includes a self-governed/decentralized identity concept. The docs also position identity as an enabler for access to services.

## Technical Details
- Docs state "self-governed, decentralised identity" is baked into the network.
- Docs emphasize privacy-first positioning and user data ownership.
- Docs describe identity as a gateway to external services (e.g., banking/insurance contexts), implying integration between network usage and identity lifecycle.

## Dependencies
- Subscriber onboarding and service access flows
- Compliance and access policy definitions
- Blockchain anchoring/interoperability patterns (if identity-related attestations are chain-linked)

## Risks / Failure Modes
- No directly extracted authoritative spec for protocol-level identity/access control implementation yet.
- Marketing-level wording may differ from production architecture details.

## Open Questions
- Concrete identity protocol stack and credential format(s).
- Authentication/authorization model across app, SIM/eSIM, and node operators.
- Accounting engine data model and settlement path.
