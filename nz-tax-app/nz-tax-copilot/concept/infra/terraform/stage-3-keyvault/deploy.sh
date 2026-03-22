#!/bin/bash
set -euo pipefail

# Stage 3: Key Vault Deployment Script
# Purpose: Deploy Azure Key Vault with RBAC authorization and private endpoint

# Error handling
trap 'echo "❌ Deployment failed at line $LINENO. Check the error above."; exit 1' ERR

# Configuration
STAGE_NAME="stage-3-keyvault"
STAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="${STAGE_DIR}/stage-3-outputs.json"

echo "=========================================="
echo "Stage 3: Key Vault Deployment"
echo "=========================================="
echo ""

# Check Azure login
echo "🔍 Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
    echo "❌ Not logged in to Azure. Run 'az login' first."
    exit 1
fi

SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Authenticated to Azure"
echo "   Subscription: ${SUBSCRIPTION_NAME}"
echo "   Subscription ID: ${SUBSCRIPTION_ID}"
echo ""

# Verify Stage 1 (Foundation) outputs exist
STAGE1_STATE="${STAGE_DIR}/../stage-1-foundation/.terraform-state/stage1-foundation.tfstate"
if [ ! -f "${STAGE1_STATE}" ]; then
    echo "❌ Stage 1 (Foundation) state file not found at ${STAGE1_STATE}"
    echo "   Deploy Stage 1 first before deploying Stage 3."
    exit 1
fi
echo "✅ Stage 1 (Foundation) state file found"

# Verify Stage 2 (Networking) outputs exist
STAGE2_STATE="${STAGE_DIR}/../stage-2-networking/.terraform-state/stage2-networking.tfstate"
if [ ! -f "${STAGE2_STATE}" ]; then
    echo "❌ Stage 2 (Networking) state file not found at ${STAGE2_STATE}"
    echo "   Deploy Stage 2 first before deploying Stage 3."
    exit 1
fi
echo "✅ Stage 2 (Networking) state file found"
echo ""

# Initialize Terraform
echo "📦 Initializing Terraform..."
cd "${STAGE_DIR}"
terraform init -input=false
echo ""

# Validate configuration
echo "🔍 Validating Terraform configuration..."
terraform validate
echo ""

# Format check
echo "🎨 Checking Terraform formatting..."
terraform fmt -check -recursive || {
    echo "⚠️  Formatting issues found. Run 'terraform fmt -recursive' to fix."
}
echo ""

# Plan deployment
echo "📋 Planning deployment..."
terraform plan -input=false -out=tfplan
echo ""

# Apply deployment
echo "🚀 Deploying Key Vault..."
terraform apply -input=false tfplan
echo ""

# Export outputs to JSON
echo "💾 Exporting stage outputs..."
terraform output -json > "${OUTPUT_FILE}"
echo "✅ Stage outputs saved to ${OUTPUT_FILE}"
echo ""

# Cleanup plan file
rm -f tfplan

# Display key outputs
echo "=========================================="
echo "✅ Stage 3 Deployment Complete"
echo "=========================================="
echo ""
echo "📊 Key Outputs:"
echo "   Key Vault Name: $(terraform output -raw key_vault_name)"
echo "   Key Vault URI: $(terraform output -raw key_vault_uri)"
echo "   Private Endpoint IP: $(terraform output -raw private_endpoint_ip || echo 'N/A')"
echo ""

# Post-deployment verification
echo "🔍 Verifying deployment..."

# Check Key Vault exists
KV_NAME=$(terraform output -raw key_vault_name)
if az keyvault show --name "${KV_NAME}" &>/dev/null; then
    echo "✅ Key Vault '${KV_NAME}' is accessible"
else
    echo "⚠️  Key Vault '${KV_NAME}' not accessible. Check private endpoint connectivity."
fi

# Check RBAC role assignment
MANAGED_IDENTITY_PRINCIPAL_ID=$(cd ../stage-1-foundation && terraform output -raw managed_identity_principal_id)
KV_ID=$(terraform output -raw key_vault_id)

echo "🔍 Verifying RBAC role assignment..."
if az role assignment list --assignee "${MANAGED_IDENTITY_PRINCIPAL_ID}" --scope "${KV_ID}" --query "[?roleDefinitionName=='Key Vault Secrets User']" -o tsv | grep -q "Key Vault Secrets User"; then
    echo "✅ Managed Identity has 'Key Vault Secrets User' role on Key Vault"
else
    echo "⚠️  Role assignment may take a few minutes to propagate. Verify with:"
    echo "   az role assignment list --assignee ${MANAGED_IDENTITY_PRINCIPAL_ID} --scope ${KV_ID}"
fi

# Check private endpoint status
PE_NAME=$(terraform output -raw private_endpoint_id | xargs basename)
RG_NAME=$(cd ../stage-1-foundation && terraform output -raw resource_group_name)

echo "🔍 Verifying private endpoint..."
PE_STATUS=$(az network private-endpoint show --name "${PE_NAME}" --resource-group "${RG_NAME}" --query 'privateLinkServiceConnections[0].privateLinkServiceConnectionState.status' -o tsv 2>/dev/null || echo "Unknown")

if [ "${PE_STATUS}" = "Approved" ]; then
    echo "✅ Private endpoint connection approved"
elif [ "${PE_STATUS}" = "Pending" ]; then
    echo "⚠️  Private endpoint connection pending approval"
else
    echo "⚠️  Private endpoint status: ${PE_STATUS}"
fi

echo ""
echo "=========================================="
echo "🎉 Stage 3 (Key Vault) deployment completed successfully!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Verify Key Vault access from managed identity:"
echo "   az keyvault secret list --vault-name ${KV_NAME} --identity ${MANAGED_IDENTITY_PRINCIPAL_ID}"
echo ""
echo "2. Deploy Stage 4 (Data Services):"
echo "   cd ../stage-4-data"
echo "   ./deploy.sh"
echo ""