#!/bin/bash
set -euo pipefail

# NZ Tax Copilot - Stage 1: Foundation Deployment
# This script deploys the foundation infrastructure including:
# - Resource Group
# - User-Assigned Managed Identity
# - Log Analytics Workspace
# - Application Insights

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../outputs"
OUTPUT_FILE="$OUTPUT_DIR/stage-1-outputs.json"

# Trap errors and cleanup
trap 'echo -e "${RED}❌ Deployment failed at line $LINENO${NC}"; cleanup_on_error' ERR

cleanup_on_error() {
    echo -e "${YELLOW}⚠️  Cleaning up temporary files...${NC}"
    rm -f "$SCRIPT_DIR/tfplan"
}

# Usage information
usage() {
    echo "Usage: $0 [--dry-run] [--destroy] [--auto-approve]"
    echo ""
    echo "Options:"
    echo "  --dry-run        Run terraform plan only (no apply)"
    echo "  --destroy        Destroy all resources (use with caution)"
    echo "  --auto-approve   Skip approval prompt for apply/destroy"
    echo ""
    exit 1
}

# Parse command line arguments
DRY_RUN=false
DESTROY=false
AUTO_APPROVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --destroy)
            DESTROY=true
            shift
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            ;;
    esac
done

# Banner
echo "=========================================="
echo "  NZ Tax Copilot - Stage 1: Foundation"
echo "=========================================="
echo ""

# Check Azure CLI login
echo -e "${YELLOW}📋 Checking Azure CLI authentication...${NC}"
if ! az account show &>/dev/null; then
    echo -e "${RED}❌ Not logged in to Azure CLI${NC}"
    echo "Please run: az login"
    exit 1
fi

SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✓ Logged in to subscription: $SUBSCRIPTION_NAME${NC}"
echo -e "${GREEN}✓ Subscription ID: $SUBSCRIPTION_ID${NC}"
echo ""

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Initialize Terraform
echo -e "${YELLOW}📦 Initializing Terraform...${NC}"
cd "$SCRIPT_DIR"
terraform init -input=false

# Validate Terraform configuration
echo -e "${YELLOW}🔍 Validating Terraform configuration...${NC}"
terraform validate

if [ "$DRY_RUN" = true ]; then
    # Dry-run mode: plan only
    echo -e "${YELLOW}🔍 Running terraform plan (dry-run mode)...${NC}"
    terraform plan -input=false
    echo ""
    echo -e "${GREEN}✓ Dry-run complete (no resources modified)${NC}"
    exit 0
fi

if [ "$DESTROY" = true ]; then
    # Destroy mode
    echo -e "${RED}⚠️  WARNING: This will destroy all Stage 1 resources!${NC}"
    echo "Resources to be destroyed:"
    echo "  - Resource Group: zd-rg-tax-dev-aue"
    echo "  - Managed Identity: zd-id-tax-dev-aue"
    echo "  - Log Analytics Workspace: pm-log-tax-dev-aue"
    echo "  - Application Insights: pm-appi-tax-dev-aue"
    echo ""

    if [ "$AUTO_APPROVE" = false ]; then
        read -p "Type 'yes' to confirm destruction: " confirm
        if [ "$confirm" != "yes" ]; then
            echo -e "${YELLOW}Destruction cancelled${NC}"
            exit 0
        fi
    fi

    echo -e "${YELLOW}🗑️  Planning destruction...${NC}"
    terraform plan -destroy -input=false -out=tfplan-destroy

    echo -e "${RED}🗑️  Destroying resources...${NC}"
    terraform apply -input=false tfplan-destroy

    rm -f tfplan-destroy
    rm -f "$OUTPUT_FILE"

    echo -e "${GREEN}✓ Stage 1 resources destroyed${NC}"
    exit 0
fi

# Plan deployment
echo -e "${YELLOW}📝 Planning deployment...${NC}"
terraform plan -input=false -out=tfplan

# Apply deployment
if [ "$AUTO_APPROVE" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Review the plan above${NC}"
    read -p "Apply these changes? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        rm -f tfplan
        exit 0
    fi
fi

echo -e "${YELLOW}🚀 Applying deployment...${NC}"
terraform apply -input=false tfplan

# Cleanup plan file
rm -f tfplan

# Export outputs to JSON
echo -e "${YELLOW}📤 Exporting outputs...${NC}"
terraform output -json > "$OUTPUT_FILE"

# Display summary
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Stage 1 Deployment Complete${NC}"
echo "=========================================="
echo ""
echo "Deployed Resources:"
echo "  • Resource Group: $(terraform output -raw resource_group_name)"
echo "  • Managed Identity: $(terraform output -raw managed_identity_name)"
echo "  • Log Analytics Workspace: $(terraform output -raw log_analytics_workspace_name)"
echo "  • Application Insights: $(terraform output -raw application_insights_name)"
echo ""
echo "Outputs exported to: $OUTPUT_FILE"
echo ""
echo "Next Steps:"
echo "  1. Review outputs: cat $OUTPUT_FILE"
echo "  2. Deploy Stage 2 (Data Services): cd ../stage-2-data && ./deploy.sh"
echo ""

# Post-deployment verification
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"

RG_NAME=$(terraform output -raw resource_group_name)
if az group show --name "$RG_NAME" &>/dev/null; then
    echo -e "${GREEN}✓ Resource group verified: $RG_NAME${NC}"
else
    echo -e "${RED}❌ Resource group not found: $RG_NAME${NC}"
    exit 1
fi

IDENTITY_NAME=$(terraform output -raw managed_identity_name)
if az identity show --name "$IDENTITY_NAME" --resource-group "$RG_NAME" &>/dev/null; then
    echo -e "${GREEN}✓ Managed identity verified: $IDENTITY_NAME${NC}"
else
    echo -e "${RED}❌ Managed identity not found: $IDENTITY_NAME${NC}"
    exit 1
fi

WORKSPACE_NAME=$(terraform output -raw log_analytics_workspace_name)
if az monitor log-analytics workspace show --workspace-name "$WORKSPACE_NAME" --resource-group "$RG_NAME" &>/dev/null; then
    echo -e "${GREEN}✓ Log Analytics workspace verified: $WORKSPACE_NAME${NC}"
else
    echo -e "${RED}❌ Log Analytics workspace not found: $WORKSPACE_NAME${NC}"
    exit 1
fi

APPINSIGHTS_NAME=$(terraform output -raw application_insights_name)
if az monitor app-insights component show --app "$APPINSIGHTS_NAME" --resource-group "$RG_NAME" &>/dev/null; then
    echo -e "${GREEN}✓ Application Insights verified: $APPINSIGHTS_NAME${NC}"
else
    echo -e "${RED}❌ Application Insights not found: $APPINSIGHTS_NAME${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All resources verified successfully${NC}"