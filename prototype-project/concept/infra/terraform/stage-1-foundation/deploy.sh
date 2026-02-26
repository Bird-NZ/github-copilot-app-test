#!/bin/bash
set -euo pipefail

# Deployment script for Stage 1: Foundation
# Creates resource group, Log Analytics workspace, and Application Insights

echo "=========================================="
echo "Stage 1: Foundation Deployment"
echo "=========================================="

# Trap errors and cleanup
trap 'echo "❌ Deployment failed at line $LINENO"' ERR

# Check Azure login
echo ""
echo "Checking Azure login status..."
if ! az account show &>/dev/null; then
  echo "❌ Not logged in to Azure. Run 'az login' first."
  exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Logged in to Azure (Subscription: $SUBSCRIPTION_ID)"

# Terraform initialization
echo ""
echo "Initializing Terraform..."
terraform init -upgrade

# Terraform validation
echo ""
echo "Validating Terraform configuration..."
terraform validate

# Terraform plan
echo ""
echo "Planning deployment..."
terraform plan -var="subscription_id=$SUBSCRIPTION_ID" -out=tfplan

# Terraform apply
echo ""
echo "Applying deployment..."
terraform apply tfplan

# Export outputs
echo ""
echo "Exporting outputs to JSON..."
terraform output -json > stage-1-outputs.json

# Cleanup plan file
rm -f tfplan

# Display summary
echo ""
echo "=========================================="
echo "✅ Stage 1 deployment complete!"
echo "=========================================="
echo ""
echo "Outputs saved to: stage-1-outputs.json"
echo ""
echo "Next steps:"
echo "1. Review outputs: cat stage-1-outputs.json | jq"
echo "2. Deploy Stage 2: cd ../stage-2-storage && ./deploy.sh"