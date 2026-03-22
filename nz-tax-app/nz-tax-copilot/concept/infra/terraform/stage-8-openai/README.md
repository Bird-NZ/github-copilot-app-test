# Stage 8: Azure OpenAI

Deploys Azure OpenAI with GPT-4o and text-embedding-ada-002 models for IRD guidance assistance.

## Resources Deployed

- **Azure OpenAI Account**: `zd-openai-tax-dev-aue`
  - SKU: Standard (S0)
  - Location: Australia East
  - Public network access: Disabled (private endpoint only)
  - Local auth: Disabled (Entra ID/managed identity only)

- **GPT-4o Model Deployment**: `gpt-4o`
  - Model: gpt-4o (version 2024-08-06)
  - Capacity: 10K TPM (configurable via variable)
  - Purpose: IRD guidance generation with RAG

- **Text Embedding Model Deployment**: `text-embedding-ada-002`
  - Model: text-embedding-ada-002 (version 2)
  - Capacity: 120K TPM (configurable via variable)
  - Purpose: Embedding generation for IRD document chunks

- **Private Endpoint**: `pe-openai-tax-dev-aue`
  - Subnet: AI subnet (from Stage 2)
  - DNS Zone: privatelink.openai.azure.com (from Stage 2)

- **RBAC Role Assignment**:
  - Managed Identity → Azure OpenAI: `Cognitive Services OpenAI User`

- **Diagnostic Settings**:
  - Logs: Audit, RequestResponse
  - Metrics: AllMetrics
  - Destination: Log Analytics workspace (from Stage 1)

- **Key Vault Secret**:
  - `openai-endpoint`: Azure OpenAI endpoint URL

## Prerequisites

- Stage 1 (Foundation) completed
- Stage 2 (Networking) completed
- Stage 3 (Key Vault) completed
- Azure subscription must have quota approved for:
  - Azure OpenAI (GPT-4o model)
  - Text embedding model
  - Minimum 10K TPM for GPT-4o
  - Minimum 120K TPM for embeddings

## Deployment

```bash
# Set subscription ID
export TF_VAR_subscription_id="your-subscription-id"

# Deploy
./deploy.sh