#!/bin/bash
set -euo pipefail

# Trap errors and cleanup
trap 'echo "❌ Deployment failed at line $LINENO"' ERR

echo "========================================"
echo "Stage 6: Cosmos DB Deployment"
echo "========================================"

# Check Azure CLI login
echo "Checking Azure CLI authentication..."
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure CLI. Please run 'az login' first."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Logged in to subscription: $SUBSCRIPTION_ID"

# Initialize Terraform
echo ""
echo "Initializing Terraform..."
terraform init -input=false

# Validate configuration
echo ""
echo "Validating Terraform configuration..."
terraform validate

# Check for prior stage state files
echo ""
echo "Checking for prior stage state files..."
STAGE1_STATE="../.terraform-state/stage1-foundation.tfstate"
STAGE2_STATE="../.terraform-state/stage2-networking.tfstate"
STAGE3_STATE="../.terraform-state/stage3-keyvault.tfstate"

if [ ! -f "$STAGE1_STATE" ]; then
    echo "❌ Stage 1 state file not found: $STAGE1_STATE"
    echo "Please deploy Stage 1 (Foundation) first."
    exit 1
fi

if [ ! -f "$STAGE2_STATE" ]; then
    echo "❌ Stage 2 state file not found: $STAGE2_STATE"
    echo "Please deploy Stage 2 (Networking) first."
    exit 1
fi

if [ ! -f "$STAGE3_STATE" ]; then
    echo "❌ Stage 3 state file not found: $STAGE3_STATE"
    echo "Please deploy Stage 3 (Key Vault) first."
    exit 1
fi

echo "✅ All prerequisite stages found"

# Plan deployment
echo ""
echo "Planning Cosmos DB deployment..."
terraform plan -input=false -out=tfplan

# Check if dry-run mode
if [[ "${DRY_RUN:-false}" == "true" ]]; then
    echo ""
    echo "✅ Dry-run complete. Plan saved to tfplan"
    echo "To apply, run: terraform apply tfplan"
    exit 0
fi

# Apply deployment
echo ""
echo "Applying Cosmos DB deployment..."
terraform apply -input=false tfplan

# Cleanup plan file
rm -f tfplan

# Export outputs to JSON
echo ""
echo "Exporting outputs..."
terraform output -json > stage-6-outputs.json
echo "✅ Outputs saved to stage-6-outputs.json"

# Display key outputs
echo ""
echo "========================================"
echo "Deployment Summary"
echo "========================================"
echo "Cosmos DB Account: $(terraform output -raw cosmos_account_name)"
echo "Cosmos DB Endpoint: $(terraform output -raw cosmos_account_endpoint)"
echo "Database Name: $(terraform output -raw cosmos_database_name)"
echo "Containers:"
echo "  - $(terraform output -raw workspaces_container_name) (partition key: /userId)"
echo "  - $(terraform output -raw questionnaire_container_name) (partition key: /workspaceId)"
echo "  - $(terraform output -raw guidance_history_container_name) (partition key: /userId, TTL: 30 days)"
echo "Private Endpoint IP: $(terraform output -raw private_endpoint_ip)"
echo ""
echo "✅ Stage 6 deployment complete!"
echo ""
echo "Next Steps:"
echo "1. Verify Cosmos DB connectivity from Container App (when deployed in Stage 9)"
echo "2. Populate containers with test data if needed"
echo "3. Continue to Stage 7: Blob Storage"
echo ""
echo "Authentication: Local auth disabled - use managed identity from Stage 1"
echo "RBAC Role: Cosmos DB Built-in Data Contributor assigned to managed identity"