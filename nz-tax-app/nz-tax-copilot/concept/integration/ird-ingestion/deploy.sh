#!/bin/bash
set -euo pipefail

###############################################################################
# Stage 16: IRD Guidance Data Ingestion
# 
# This stage generates the Python ingestion script and configuration files.
# The actual ingestion is executed manually or via CI/CD after this stage.
###############################################################################

# Trap errors and cleanup
trap 'echo "❌ Deployment failed on line $LINENO"' ERR

echo "=========================================="
echo "Stage 16: IRD Guidance Data Ingestion"
echo "=========================================="
echo ""

# Check Azure CLI authentication
echo "Checking Azure CLI authentication..."
if ! az account show &>/dev/null; then
    echo "ERROR: Not logged in to Azure CLI. Run 'az login' first."
    exit 1
fi

SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
echo "✓ Authenticated to subscription: $SUBSCRIPTION_NAME"
echo ""

# Parse command-line arguments
DRY_RUN=false
AUTO_APPROVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--dry-run] [--auto-approve]"
            exit 1
            ;;
    esac
done

# Read outputs from prior stages
echo "Reading outputs from prior stages..."

if [ ! -f "../.terraform-state/stage1-foundation.tfstate" ]; then
    echo "ERROR: Stage 1 state file not found. Run Stage 1 first."
    exit 1
fi

if [ ! -f "../.terraform-state/stage9-ai-search.tfstate" ]; then
    echo "ERROR: Stage 9 state file not found. Run Stage 9 first."
    exit 1
fi

if [ ! -f "../.terraform-state/stage13-search-index.tfstate" ]; then
    echo "ERROR: Stage 13 state file not found. Run Stage 13 first."
    exit 1
fi

# Extract required outputs using Terraform output command
cd ../.terraform-state

RESOURCE_GROUP_NAME=$(terraform output -state=stage1-foundation.tfstate -raw resource_group_name 2>/dev/null || echo "")
MANAGED_IDENTITY_ID=$(terraform output -state=stage1-foundation.tfstate -raw managed_identity_id 2>/dev/null || echo "")
MANAGED_IDENTITY_CLIENT_ID=$(terraform output -state=stage1-foundation.tfstate -raw managed_identity_client_id 2>/dev/null || echo "")
LOG_ANALYTICS_WORKSPACE_ID=$(terraform output -state=stage1-foundation.tfstate -raw log_analytics_workspace_id 2>/dev/null || echo "")

SEARCH_SERVICE_NAME=$(terraform output -state=stage9-ai-search.tfstate -raw search_service_name 2>/dev/null || echo "")
OPENAI_ENDPOINT=$(terraform output -state=stage8-openai.tfstate -raw openai_endpoint 2>/dev/null || echo "")
OPENAI_DEPLOYMENT_EMBEDDINGS=$(terraform output -state=stage8-openai.tfstate -raw openai_deployment_embeddings 2>/dev/null || echo "")

SEARCH_INDEX_NAME=$(terraform output -state=stage13-search-index.tfstate -raw search_index_name 2>/dev/null || echo "")

cd - >/dev/null

# Validate required outputs
if [ -z "$RESOURCE_GROUP_NAME" ]; then
    echo "ERROR: Could not read resource_group_name from Stage 1 outputs"
    exit 1
fi

if [ -z "$SEARCH_SERVICE_NAME" ]; then
    echo "ERROR: Could not read search_service_name from Stage 9 outputs"
    exit 1
fi

if [ -z "$SEARCH_INDEX