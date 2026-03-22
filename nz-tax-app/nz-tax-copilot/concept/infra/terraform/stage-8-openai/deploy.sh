#!/bin/bash
set -euo pipefail

# Trap errors and cleanup
trap 'echo "❌ Deployment failed at line $LINENO"' ERR

echo "=========================================="
echo "Stage 8: Azure OpenAI Deployment"
echo "=========================================="
echo ""

# Check Azure CLI login
if ! az account show &>/dev/null; then
    echo "❌ Not logged in to Azure CLI"
    echo "Run: az login"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✓ Using subscription: $SUBSCRIPTION_ID"
echo ""

# Load outputs from prior stages
if [ ! -f "../.terraform-state/stage1-foundation.tfstate" ]; then
    echo "❌ Stage 1 (Foundation) state file not found"
    echo "Run Stage 1 deployment first"
    exit 1
fi

if [ ! -f "../.terraform-state/stage2-networking.tfstate" ]; then
    echo "❌ Stage 2 (Networking) state file not found"
    echo "Run Stage 2 deployment first"
    exit 1
fi

if [ ! -f "../.terraform-state/stage3-keyvault.tfstate" ]; then
    echo "❌ Stage 3 (Key Vault) state file not found"
    echo "Run Stage 3 deployment first"
    exit 1
fi

echo "✓ All prerequisite stages completed"
echo ""

# Initialize Terraform
echo "Initializing Terraform..."
terraform init -input=false
echo ""

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate
echo ""

# Check for required variables
if [ -z "${TF_VAR_subscription_id:-}" ]; then
    export TF_VAR_subscription_id="$SUBSCRIPTION_ID"
fi

# Plan deployment
echo "Planning deployment..."
terraform plan \
    -input=false \
    -out=stage8.tfplan
echo ""

# Prompt for confirmation
read -p "Apply this deployment? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    rm -f stage8.tfplan
    exit 1
fi

# Apply deployment
echo ""
echo "Applying deployment..."
terraform apply -input=false stage8.tfplan
echo ""

# Cleanup plan file
rm -f stage8.tfplan

# Export outputs to JSON
echo "Exporting outputs..."
terraform output -json > stage-8-outputs.json
echo "✓ Outputs saved to stage-8-outputs.json"
echo ""

# Display key outputs
echo "=========================================="
echo "Deployment Complete"
echo "=========================================="
echo ""
echo "Azure OpenAI Account: $(terraform output -raw openai_account_name)"
echo "Endpoint: $(terraform output -raw openai_endpoint)"
echo "GPT-4o Deployment: $(terraform output -raw gpt4o_deployment_name)"
echo "Embeddings Deployment: $(terraform output -raw embeddings_deployment_name)"
echo ""
echo "Private endpoint configured in AI subnet"
echo "Managed identity RBAC assigned: Cognitive Services OpenAI User"
echo "Diagnostic logs enabled → Log Analytics"
echo "Endpoint stored in Key Vault: openai-endpoint"
echo ""

# Post-deployment verification
echo "Verifying deployment..."

OPENAI_NAME=$(terraform output -raw openai_account_name)
RG_NAME=$(terraform output -json | jq -r '.resource_group_name.value // empty')

if [ -z "$RG_NAME" ]; then
    # Fallback: read from Stage 1 outputs
    RG_NAME=$(cd ../stage-1-foundation && terraform output -raw resource_group_name)
fi

# Check OpenAI account exists
if az cognitiveservices account show \
    --name "$OPENAI_NAME" \
    --resource-group "$RG_NAME" &>/dev/null; then
    echo "✓ Azure OpenAI account verified"
else
    echo "⚠ Could not verify Azure OpenAI account"
fi

# Check model deployments
DEPLOYMENTS=$(az cognitiveservices account deployment list \
    --name "$OPENAI_NAME" \
    --resource-group "$RG_NAME" \
    --query "[].name" -o tsv)

if echo "$DEPLOYMENTS" | grep -q "gpt-4o"; then
    echo "✓ GPT-4o deployment verified"
else
    echo "⚠ GPT-4o deployment not found"
fi

if echo "$DEPLOYMENTS" | grep -q "text-embedding-ada-002"; then
    echo "✓ Text embedding deployment verified"
else
    echo "⚠ Text embedding deployment not found"
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo "1. Verify private endpoint DNS resolution:"
echo "   nslookup ${OPENAI_NAME}.openai.azure.com"
echo ""
echo "2. Test OpenAI access from Container App (Stage 9+):"
echo "   Use Azure SDK with DefaultAzureCredential"
echo ""
echo "3. Populate AI Search index (Stage 9):"
echo "   Run IRD guidance ingestion script"
echo ""