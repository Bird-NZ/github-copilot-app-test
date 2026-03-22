# Stage 9: AI Search

This stage deploys the Azure AI Search service for the NZ Tax Copilot IRD guidance feature, using vector search with HNSW algorithm for semantic similarity matching.

## Resources Deployed

- **AI Search Service** (`zd-search-tax-dev-aue`)
  - SKU: Basic (1 replica, 1 partition, 2 GB storage)
  - Authentication: Managed identity only (local API key auth disabled)
  - Network: Private endpoint only (public access disabled)
  - Vector Search: HNSW algorithm with cosine similarity
  
- **Private Endpoint** (`pe-search-tax-dev-aue`)
  - Subnet: `snet-ai` (from Stage 2)
  - DNS Zone: `privatelink.search.windows.net` (from Stage 2)
  
- **RBAC Role Assignments**
  - AI Search → Storage Account: `Storage Blob Data Reader` (for indexer data source)
  - AI Search → Azure OpenAI: `Cognitive Services OpenAI User` (for skillset enrichment)

## Dependencies

This stage depends on:
- **Stage 1** (Foundation): Resource group, Log Analytics workspace
- **Stage 2** (Networking): VNET, `snet-ai` subnet, private DNS zones
- **Stage 7** (Blob Storage): Storage account for potential indexer data source
- **Stage 8** (Azure OpenAI): OpenAI account for embedding generation in skillsets

## Outputs

This stage exports:
- `search_service_id`: AI Search service resource ID
- `search_service_name`: Service name (for index creation commands)
- `search_service_endpoint`: HTTPS endpoint URL
- `search_service_identity_principal_id`: Managed identity principal ID
- `search_service_identity_tenant_id`: Managed identity tenant ID
- `private_endpoint_id`: Private endpoint resource ID
- `index_creation_command`: CLI command to create the IRD guidance index

## Deployment

### Prerequisites
- Stage 1 (Foundation) deployed
- Stage 2 (Networking) deployed
- Stage 7 (Blob Storage) deployed
- Stage 8 (Azure OpenAI) deployed

### Deploy
```bash
# Normal deployment
./deploy.sh

# Dry-run (plan only)
DRY_RUN=true ./deploy.sh