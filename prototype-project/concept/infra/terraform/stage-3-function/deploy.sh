#!/bin/bash
set -euo pipefail

# Trap errors and cleanup
trap 'echo "❌ Deployment failed at line $LINENO"' ERR

echo "=========================================="
echo "Stage 3: Function App Deployment"
echo "=========================================="

# Check Azure CLI login
if ! az account show &>/dev/null; then
  echo "❌ Error: Not logged into Azure CLI"
  echo "Run: az login"
  exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Azure CLI authenticated"
echo "📋 Subscription: $SUBSCRIPTION_ID"

# Verify required outputs from Stage 1
if [ ! -f "../stage-1-foundation/terraform.tfstate" ]; then
  echo "❌ Error: Stage 1 state file not found"
  echo "Deploy Stage 1 first: cd ../stage-1-foundation && terraform apply"
  exit 1
fi

# Verify required outputs from Stage 2
if [ ! -f "../stage-2-storage/terraform.tfstate" ]; then
  echo "❌ Error: Stage 2 state file not found"
  echo "Deploy Stage 2 first: cd ../stage-2-storage && terraform apply"
  exit 1
fi

echo ""
echo "📦 Initializing Terraform..."
terraform init -upgrade

echo ""
echo "✅ Validating Terraform configuration..."
terraform validate

echo ""
echo "📋 Planning deployment..."
terraform plan \
  -var="subscription_id=$SUBSCRIPTION_ID" \
  -out=tfplan

echo ""
echo "🚀 Applying Terraform configuration..."
terraform apply tfplan

echo ""
echo "📤 Exporting outputs to JSON..."
terraform output -json > ../stage-3-outputs.json

# Cleanup plan file
rm -f tfplan

echo ""
echo "=========================================="
echo "✅ Stage 3 Deployment Complete"
echo "=========================================="

# Display function app URL
FUNCTION_URL=$(terraform output -raw function_app_url)
echo ""
echo "Function App URL: $FUNCTION_URL"
echo "Function endpoint will be: ${FUNCTION_URL}/api/hello"
echo ""
echo "⚠️  Note: Function code must be deployed separately (Stage 4)"
echo "Deploy function code with: cd ../../../app && func azure functionapp publish <function-app-name>"