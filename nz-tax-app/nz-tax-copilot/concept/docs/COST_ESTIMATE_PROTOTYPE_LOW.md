# Prototype Low-Cost Profile (Recommended)

## Goal
Minimize monthly spend while retaining end-to-end demo capability.

## Included services
- Container Apps (single small API service)
- Azure SQL Database (serverless, smallest practical)
- Blob Storage (small)
- Azure OpenAI (low-volume)
- Key Vault (basic)
- Container Registry (basic)
- Minimal monitoring (App Insights + capped Log Analytics)

## Deferred or reduced
- AI Search (defer for prototype)
- Private Endpoints (defer unless compliance requires)
- Cosmos DB (defer; use one primary DB)
- High-ingestion logging defaults (apply strict daily cap)

## Approximate monthly estimate (USD)
- Container Apps API: $20-$30
- Azure SQL (serverless small): $10-$20
- Blob Storage: $5-$10
- Azure OpenAI (low prototype usage): $20-$40
- Key Vault: ~$5
- ACR Basic: ~$5
- Monitoring (capped): $15-$40

## Estimated total
**$80-$150 / month** (prototype-low profile)

## Notes
- This is a deliberate reduction from the default Small estimate (~$285/mo) by deferring AI Search and aggressively capping observability + network extras.
- If semantic RAG search is required in prototype, add roughly +$75/mo (AI Search Basic), moving range toward ~$155-$225/mo.
