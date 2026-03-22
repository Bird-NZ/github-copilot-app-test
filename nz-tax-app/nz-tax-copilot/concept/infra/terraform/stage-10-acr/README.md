# Stage 10: Container Registry

This stage deploys Azure Container Registry (ACR) with private endpoint for secure container image storage.

## Resources Deployed

- **Azure Container Registry** (`zdacrtaxdevaue`)
  - SKU: Basic
  - Admin user: Disabled (managed identity access only)
  - Public network access: Disabled
  - Private endpoint: `pe-acr-tax` (in `snet-data` subnet)

## Prerequisites

The following stages must be deployed first:
- Stage 1: Foundation (resource group, managed identity, Log Analytics)
- Stage 2: Networking (VNET, subnets, private DNS zones)

## Deployment

### Standard Deployment
```bash
./deploy.sh