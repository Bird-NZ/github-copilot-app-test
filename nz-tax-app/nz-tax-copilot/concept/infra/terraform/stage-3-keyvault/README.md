# Stage 3: Key Vault

This stage deploys Azure Key Vault with RBAC authorization, soft delete, purge protection, and private endpoint connectivity.

## Resources Deployed

- **Key Vault**: `zd-kv-tax-dev-aue` (Standard SKU, RBAC mode)
- **Private Endpoint**: `pe-kv-tax-dev-aue` (in `snet-data` subnet)
- **Private DNS Zone Group**: Links private endpoint to `privatelink.vaultcore.azure.net`
- **RBAC Role Assignment**: Managed identity from Stage 1 granted `Key Vault Secrets User` role
- **Diagnostic Settings**: Send audit logs to Log Analytics workspace from Stage 1

## Prerequisites

- **Stage 1** (Foundation) deployed successfully
- **Stage 2** (Networking) deployed successfully
- Azure CLI authenticated with appropriate subscription selected

## Deployment

```bash
# Navigate to stage directory
cd concept/infra/terraform/stage-3-keyvault

# Deploy stage
./deploy.sh