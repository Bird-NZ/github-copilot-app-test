#!/bin/bash
set -euo pipefail

#################################################
# Azure AD B2C Verification Script
# 
# This script validates the B2C tenant configuration:
# - Tenant accessibility
# - App registrations exist and are correctly configured
# - User flows are active
# - Key Vault secrets are stored
#################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1"
}

#################################################
# Verification Checks
#################################################

ERRORS=0

log_info "Starting B2C configuration verification..."
log_info ""

# Check if outputs file exists
if [ ! -f "b2c-outputs.json" ]; then
    log_fail "b2c-outputs.json not found. Run setup-b2c.sh first."
    exit 1
fi

# Load configuration
B2C_TENANT_NAME=$(jq -r '.tenant_name' b2c-outputs.json)
B2C_TENANT_ID=$(jq -r '.tenant_id' b2c-outputs.json)
FRONTEND_CLIENT_ID=$(jq -r '.frontend_client_id' b2c-outputs.json)
API_CLIENT_ID=$(jq -r '.api_client_id' b2c-outputs.json)

log_info "Loaded configuration:"
log_info "  Tenant: $B2C_TENANT_NAME"
log_info "  Tenant ID: $B2C_TENANT_ID"
log_info ""

#################################################
# Check 1: Tenant Accessibility
#################################################

log_info "Check 1: Verifying B2C tenant accessibility..."

if az rest --method GET --url "https://graph.microsoft.com/v1.0/domains/$B2C_TENANT_NAME" &> /dev/null; then
    log_success "B2C tenant is accessible"
else
    log_fail "Cannot access B2C tenant $B2C_TENANT_NAME"
    ERRORS=$((ERRORS + 1))
fi

log_info ""

#################################################
# Check 2: API App Registration
#################################################

log_info "Check 2: Verifying API app registration..."

API_APP=$(az ad app show --id "$API_CLIENT_ID" 2>/dev/null || echo "")

if [ -z "$API_APP" ]; then
    log_fail "API app registration not found: $API_CLIENT_ID"
    ERRORS=$((ERRORS + 1))
else
    log_success "API app registration exists: $API_CLIENT_ID"
    
    # Check identifier URI
    IDENTIFIER_URI=$(echo "$API_APP" | jq -r '.identifierUris[0]')
    if [ "$IDENTIFIER_URI" == "api://nz-tax-copilot-api" ]; then
        log_success "  Identifier URI configured correctly"
    else
        log_warn "  Identifier URI mismatch: $IDENTIFIER_URI (expected: api://nz-tax-copilot-api)"
    fi
    
    # Check API scope
    SCOPE_COUNT=$(echo "$API_APP" | jq '.api.oauth2PermissionScopes | length')
    if [ "$SCOPE_COUNT" -gt 0 ]; then
        log_success "  API scopes defined: $SCOPE_COUNT"
    else
        log_warn "  No API scopes defined"
    fi
fi

log_info ""

#################################################
# Check 3: Frontend App Registration
#################################################

log_info "Check 3: Verifying frontend app registration..."

FRONTEND_APP=$(az ad app show --id "$FRONTEND_CLIENT_ID" 2>/dev/null || echo "")

if [ -z "$FRONTEND_APP" ]; then
    log_fail "Frontend app registration not found: $FRONTEND_CLIENT_ID"
    ERRORS=$((ERRORS + 1))
else
    log_success "Frontend app registration exists: $FRONTEND_CLIENT_ID"
    
    # Check redirect URIs
    REDIRECT_COUNT=$(echo "$FRONTEND_APP" | jq '.spa.redirectUris | length')
    if [ "$REDIRECT_COUNT" -gt 0 ]; then
        log_success "  Redirect URIs configured: $REDIRECT_COUNT"
    else
        log_warn "  No redirect URIs configured"
    fi
    
    # Check API permissions
    PERMISSION_COUNT=$(echo "$FRONTEND_APP" | jq '.requiredResourceAccess | length')
    if [ "$PERMISSION_COUNT" -gt 0 ]; then
        log_success "  API permissions granted: $PERMISSION_COUNT"
    else
        log_warn "  No API permissions granted"
    fi
fi

log_info ""

#################################################
# Check 4: Key Vault Secrets
#################################################

log_info "Check 4: Verifying Key Vault secrets..."

KV_NAME="zd-kv-tax-dev-aue"

REQUIRED_SECRETS=(
    "b2c-tenant-name"
    "b2c-tenant-id"
    "b2c-frontend-client-id"
    "b2c-api-client-id"
    "b2c-api-client-secret"
)

for SECRET_NAME in "${REQUIRED_SECRETS[@]}"; do
    if az keyvault secret show --vault-name "$KV_NAME" --name "$SECRET_NAME" &> /dev/null; then
        log_success "  Secret exists: $SECRET_NAME"
    else
        log_fail "  Missing secret: $SECRET_NAME"
        ERRORS=$((ERRORS + 1))
    fi
done

log_info ""

#################################################
# Check 5: User Flows (Manual Check)
#################################################

log_info "Check 5: User flows (manual verification required)..."

log_warn "User flows cannot be verified via CLI."
log_warn "Please confirm these exist in the Azure Portal:"
log_warn "  - B2C_1_signup_signin (Sign-up and sign-in)"
log_warn "  - B2C_1_password_reset (Password reset)"
log_info ""

#################################################
# Summary
#################################################

if [ $ERRORS -eq 0 ]; then
    log_info "=========================================="
    log_success "All automated checks passed!"
    log_info "=========================================="
    log_info ""
    log_info "Next steps:"
    log_info "  1. Manually verify user flows in Azure Portal"
    log_info "  2. Proceed to Stage 5: Application Deployment"
    log_info ""
else
    log_info "=========================================="
    log_fail "$ERRORS check(s) failed"
    log_info "=========================================="
    log_info ""
    log_info "Review errors above and re-run setup-b2c.sh if needed."
    exit 1
fi