#!/bin/bash
set -euo pipefail

# Stage 2: Networking Deployment Script
# Deploys Virtual Network, subnets, NSGs, and Private DNS Zones
# Dependencies: Stage 1 (Foundation) must be completed

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAGE_NAME="stage2-networking"
STAGE1_DIR="../stage-1-foundation"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Error handling
trap 'echo -e "${RED}❌ Deployment failed at line $LINENO${NC}"; exit 1' ERR

# Functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse command line arguments
DRY_RUN=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Run terraform plan only (no apply)"
            echo "  -h, --help   Display this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Preflight checks
log_info "Running preflight checks..."

# Check Azure CLI login
if ! az account show &>/dev/null; then
    log_error "Not logged in to Azure CLI. Run 'az login' first."
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_info "Azure subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

# Check Stage 1 outputs exist
if [ ! -f "$STAGE1_DIR/stage-1-outputs.json" ]; then
    log_error "Stage 1 outputs not found. Deploy Stage 1 (Foundation) first."
    log_error "Expected file: $STAGE1_DIR/stage-1-outputs.json"
    exit 1
fi

log_info "Stage 1 outputs found. Reading dependencies..."

# Read Stage 1 outputs
RESOURCE_GROUP_NAME=$(jq -r '.resource_group_name.value' "$STAGE1_DIR/stage-1-outputs.json")

if [ -z "$RESOURCE_GROUP_NAME" ] || [ "$RESOURCE_GROUP_NAME" = "null" ]; then
    log_error "Could not read resource_group_name from Stage 1 outputs"
    exit 1
fi

log_info "Resource Group: $RESOURCE_GROUP_NAME"

# Verify resource group exists
if ! az group show --name "$RESOURCE_GROUP_NAME" &>/dev/null; then
    log_error "Resource group $RESOURCE_GROUP_NAME not found. Stage 1 deployment may have failed."
    exit 1
fi

log_info "✅ Preflight checks passed"

# Terraform initialization
log_info "Initializing Terraform..."
terraform init -input=false

# Terraform validation
log_info "Validating Terraform