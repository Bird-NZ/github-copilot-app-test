#!/bin/bash
set -euo pipefail

#################################################
# Azure AD B2C Deployment Orchestration
# 
# This script coordinates the B2C setup process
# and exports outputs for downstream stages.
#################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# Error trap
trap 'log_error "Deployment failed at line $LINENO. Exit code: $?"' ERR

#################################################
# Pre-flight Checks
#################################################

log_section "Pre-flight Checks"

# Check Azure CLI
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed"
    exit 1
fi

# Check jq
if ! command -v jq &> /dev/null; then
    log_error "jq is not installed (required for JSON parsing)"
    exit 1
fi

# Check login status
if ! az account show &> /dev/null; then
    log_error "Not logged in to Azure. Run 'az login' first."
    exit 1
fi

CURRENT_SUBSCRIPTION=$(az account show --query name -o tsv)
CURRENT_TENANT=$(az account show --query tenantId -o tsv)

log_info "Current subscription: $CURRENT_SUBSCRIPTION"
log_info "Current tenant: $CURRENT_TENANT"

#################################################
# Stage 1: B2C Tenant Check
#################################################

log_section "Stage 1: B2C Tenant Verification"

B2C_TENANT_NAME="nztaxcopilot.onmicrosoft.com"

log_info "Checking for B2C tenant: $B2C_TENANT_NAME"

if ! az rest --method GET --url "https://graph.microsoft.com/v1.0/domains/$B2C_TENANT_NAME" &> /dev/null; then
    log_warn "B2C tenant not found. You must create it manually first."
    log_warn ""
    log_warn "Follow these steps:"
    log_warn "  1. Go to Azure Portal: https://portal.azure.com"
    log_warn "  2. Search for 'Azure AD B2C'"
    log_warn "  3. Click 'Create a new Azure AD B2C Tenant'"
    log_warn "  4. Organization name: NZ Tax Copilot"
    log_warn "  5. Initial domain: nztaxcopilot"
    log_warn "  6. Country: New Zealand"
    log_warn "  7. Subscription: Select your subscription"
    log_warn "  8. Resource group: zd-rg-tax-dev-aue"
    log_warn ""
    log_warn "After creation, re-run this script."
    exit 1
fi

log_info "✓ B2C tenant exists"

#################################################
# Stage 2: Run B2C Setup
#################################################

log_section "Stage 2: