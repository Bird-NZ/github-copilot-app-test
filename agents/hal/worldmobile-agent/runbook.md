# World Mobile Specialist Agent — Build Runbook

## 1) Ingest sources
For each layer, create documents under knowledge/<layer>/ using TEMPLATE.md.

Minimum source targets:
- Official documentation
- Official repositories
- Official chain/explorer resources
- Official tokenomics/economic docs
- Developer/API docs

## 2) Validate quality
- Every claim should map to at least one source.
- Mark low confidence for unverified or secondary-source claims.
- Add explicit "unknown" entries instead of guessing.

## 3) Query behavior tests
Test prompts:
1. "Explain how Air/Aether/Earth Nodes interact end-to-end."
2. "How does identity and access control work in the network core?"
3. "What is the role of WMT/WMTx in staking and rewards?"
4. "What Unity integration surfaces are available?"
5. "What’s uncertain or undocumented right now?"

Pass criteria:
- Correct layer mapping
- Sources cited
- No fabricated specifics
- Clear certainty labels

## 4) Maintenance cadence
- Weekly: verify high-change docs (blockchain/economic)
- Monthly: full source revalidation
- On major announcements: immediate targeted refresh
