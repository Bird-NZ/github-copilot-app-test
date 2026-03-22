#!/bin/bash
set -euo pipefail

#################################################
# Azure AD B2C Setup Script
# 
# This script automates the creation of:
# - App registrations (API and frontend)
# - User flows (sign-up/sign-in, password reset)
# - Configuration export to b2c-outputs.json
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

# Error trap
trap 'log_error "Script failed at line $LINENO. Exit code: $?"' ERR

#################################################
# Step 1: Verify Prerequisites
#################################################

log_info "Verifying prerequisites..."

# Check Azure CLI is installed
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed. Install from https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check Azure CLI version
AZ_VERSION=$(az version --query '."azure-cli"' -o tsv)
log_info "Azure CLI version: $AZ_VERSION"

# Check login status
if ! az account show &> /dev/null; then
    log_error "Not logged in to Azure. Run 'az login' first."
    exit 1
fi

CURRENT_TENANT_ID=$(az account show --query tenantId -o tsv)
log_info "Current Azure AD tenant: $CURRENT_TENANT_ID"

# Verify B2C tenant exists
B2C_TENANT_NAME="nztaxcopilot.onmicrosoft.com"
log_info "Checking for B2C tenant: $B2C_TENANT_NAME"

# Attempt to get B2C tenant details
if ! az rest --method GET --url "https://graph.microsoft.com/v1.0/domains/$B2C_TENANT_NAME" &> /dev/null; then
    log_error "B2C tenant $B2C_TENANT_NAME not found. Create it manually first (see README.md)."
    exit 1
fi

log_info "✓ B2C tenant found: $B2C_TENANT_NAME"

# Get B2C tenant ID
B2C_TENANT_ID=$(az rest --method GET --url "https://graph.microsoft.com/v1.0/organization" --query "value[0].id" -o tsv)
log_info "B2C Tenant ID: $B2C_TENANT_ID"

#################################################
# Step 2: Create Backend API App Registration
#################################################

log_info "Creating backend API app registration..."

API_APP_NAME="NZ Tax Copilot API"
API_APP_ID=$(az ad app list --display-name "$API_APP_NAME" --query "[0].appId" -o tsv)

if [ -z "$API_APP_ID" ]; then
    log_info "Creating new app registration: $API_APP_NAME"
    
    # Create app registration
    API_APP_ID=$(az ad app create \
        --display-name "$API_APP_NAME" \
        --sign-in-audience "AzureADandPersonalMicrosoftAccount" \
        --query appId -o tsv)
    
    log_info "✓ Created app registration: $API_APP_ID"
else
    log_warn "App registration already exists: $API_APP_ID (skipping creation)"
fi

# Configure API app registration
log_info "Configuring API app registration..."

# Create API scope (for frontend to request access)
API_SCOPE_ID=$(uuidgen)
API_SCOPE_NAME="api.access"

az ad app update \
    --id "$API_APP_ID" \
    --identifier-uris "api://nz-tax-copilot-api" \
    --set api.oauth2PermissionScopes="[
        {
            \"id\": \"$API_SCOPE_ID\",
            \"value\": \"$API_SCOPE_NAME\",
            \"type\": \"User\",
            \"adminConsentDescription\": \"Allow the application to access the Tax Copilot API on behalf of the user\",
            \"adminConsentDisplayName\": \"Access Tax Copilot API\",
            \"userConsentDescription\": \"Allow the application to access your tax data\",
            \"userConsentDisplayName\": \"Access your tax data\",
            \"isEnabled\": true
        }
    ]"

log_info "✓ Configured API scope: $API_SCOPE_NAME"

# Create client secret (only if backend needs it for certain flows)
log_info "Generating client secret for API..."

API_SECRET=$(az ad app credential reset \
    --id "$API_APP_ID" \
    --append \
    --query password -o tsv)

log_info "✓ Generated client secret (stored in Key Vault)"

#################################################
# Step 3: Create Frontend App Registration
#################################################

log_info "Creating frontend SPA app registration..."

FRONTEND_APP_NAME="NZ Tax Copilot Frontend"
FRONTEND_APP_ID=$(az ad app list --display-name "$FRONTEND_APP_NAME" --query "[0].appId" -o tsv)

if [ -z "$FRONTEND_APP_ID" ]; then
    log_info "Creating new app registration: $FRONTEND_APP_NAME"
    
    # Create app registration
    FRONTEND_APP_ID=$(az ad app create \
        --display-name "$FRONTEND_APP_NAME" \
        --sign-in-audience "AzureADandPersonalMicrosoftAccount" \
        --query appId -o tsv)
    
    log_info "✓ Created app registration: $FRONTEND_APP_ID"
else
    log_warn "App registration already exists: $FRONTEND_APP_ID (skipping creation)"
fi

# Configure frontend app registration
log_info "Configuring frontend app registration..."

# Set redirect URIs (SPA)
az ad app update \
    --id "$FRONTEND_APP_ID" \
    --web-redirect-uris \
        "https://zd-ca-web-dev-aue.australiaeast.azurecontainerapps.io/auth/callback" \
        "http://localhost:3000/auth/callback" \
    --set spa.redirectUris="[
        \"https://zd-ca-web-dev-aue.australiaeast.azurecontainerapps.io/auth/callback\",
        \"http://localhost:3000/auth/callback\"
    ]"

log_info "✓ Configured redirect URIs for frontend SPA"

# Grant API permissions (frontend → API scope)
log_info "Granting frontend permission to access backend API..."

az ad app permission add \
    --id "$FRONTEND_APP_ID" \
    --api "$API_APP_ID" \
    --api-permissions "$API_SCOPE_ID=Scope"

# Admin consent (auto-grant for prototype)
az ad app permission grant \
    --id "$FRONTEND_APP_ID" \
    --api "$API_APP_ID" \
    --scope "$API_SCOPE_NAME"

log_info "✓ Granted frontend access to backend API scope"

#################################################
# Step 4: Create User Flows
#################################################

log_info "Creating B2C user flows..."

# Note: User flows must be created via Azure Portal or Microsoft Graph API
# CLI does not support B2C user flow creation directly
# The following is a placeholder — implement via Graph API if needed

log_warn "User flows must be created manually in Azure Portal for this prototype."
log_warn "Required user flows:"
log_warn "  - B2C_1_signup_signin (Sign-up and sign-in)"
log_warn "  - B2C_1_password_reset (Password reset)"
log_warn ""
log_warn "Follow the steps in README.md to create these flows."

#################################################
# Step 5: Store Secrets in Key Vault
#################################################

log_info "Storing B2C configuration in Key Vault..."

# Get Key Vault name from Stage 3 outputs
KV_NAME="zd-kv-tax-dev-aue"

# Verify Key Vault exists
if ! az keyvault show --name "$KV_NAME" &> /dev/null; then
    log_error "Key Vault $KV_NAME not found. Run Stage 3 first."
    exit 1
fi

# Store non-sensitive configuration
az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name "b2c-tenant-name" \
    --value "$B2C_TENANT_NAME" \
    --output none

az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name "b2c-tenant-id" \
    --value "$B2C_TENANT_ID" \
    --output none

az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name "b2c-frontend-client-id" \
    --value "$FRONTEND_APP_ID" \
    --output none

az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name "b2c-api-client-id" \
    --value "$API_APP_ID" \
    --output none

# Store sensitive client secret
az keyvault secret set \
    --vault-name "$KV_NAME" \
    --name "b2c-api-client-secret" \
    --value "$API_SECRET" \
    --output none

log_info "✓ Stored B2C configuration in Key Vault: $KV_NAME"

#################################################
# Step 6: Generate Configuration Outputs
#################################################

log_info "Generating configuration outputs..."

# Create b2c-outputs.json
cat > b2c-outputs.json << EOF
{
  "tenant_name": "$B2C_TENANT_NAME",
  "tenant_id": "$B2C_TENANT_ID",
  "frontend_client_id": "$FRONTEND_APP_ID",
  "api_client_id": "$API_APP_ID",
  "authority": "https://$B2C_TENANT_NAME/$B2C_TENANT_ID/v2.0/",
  "api_scope": "api://nz-tax-copilot-api/$API_SCOPE_NAME",
  "user_flows": {
    "signup_signin": "B2C_1_signup_signin",
    "password_reset": "B2C_1_password_reset"
  },
  "endpoints": {
    "authorize": "https://$B2C_TENANT_NAME/$B2C_TENANT_ID/oauth2/v2.0/authorize",
    "token": "https://$B2C_TENANT_NAME/$B2C_TENANT_ID/oauth2/v2.0/token",
    "jwks": "https://$B2C_TENANT_NAME/$B2C_TENANT_ID/discovery/v2.0/keys"
  }
}
EOF

log_info "✓ Generated b2c-outputs.json"

# Create b2c-config.json (full configuration for reference)
cat > b2c-config.json << EOF
{
  "tenant": {
    "name": "$B2C_TENANT_NAME",
    "id": "$B2C_TENANT_ID"
  },
  "apps": {
    "api": {
      "client_id": "$API_APP_ID",
      "identifier_uri": "api://nz-tax-copilot-api",
      "scopes": ["$API_SCOPE_NAME"]
    },
    "frontend": {
      "client_id": "$FRONTEND_APP_ID",
      "redirect_uris": [
        "https://zd-ca-web-dev-aue.australiaeast.azurecontainerapps.io/auth/callback",
        "http://localhost:3000/auth/callback"
      ]
    }
  },
  "key_vault": {
    "name": "$KV_NAME",
    "secrets": [
      "b2c-tenant-name",
      "b2c-tenant-id",
      "b2c-frontend-client-id",
      "b2c-api-client-id",
      "b2c-api-client-secret"
    ]
  }
}
EOF

log_info "✓ Generated b2c-config.json"

#################################################
# Step 7: Final Summary
#################################################

log_info ""
log_info "=========================================="
log_info "Azure AD B2C Setup Complete"
log_info "=========================================="
log_info ""
log_info "B2C Tenant: $B2C_TENANT_NAME"
log_info "Tenant ID:  $B2C_TENANT_ID"
log_info ""
log_info "App Registrations:"
log_info "  - API:      $API_APP_ID"
log_info "  - Frontend: $FRONTEND_APP_ID"
log_info ""
log_info "Configuration Files:"
log_info "  - b2c-outputs.json (consumed by downstream stages)"
log_info "  - b2c-config.json (full configuration reference)"
log_info ""
log_info "Key Vault Secrets:"
log_info "  - Key Vault: $KV_NAME"
log_info "  - Secrets:   b2c-tenant-name, b2c-tenant-id, b2c-frontend-client-id, b2c-api-client-id, b2c-api-client-secret"
log_info ""
log_warn "IMPORTANT: Create user flows manually in Azure Portal:"
log_warn "  1. Navigate to Azure AD B2C in the portal"
log_warn "  2. Go to User flows → + New user flow"
log_warn "  3. Create 'B2C_1_signup_signin' (Sign-up and sign-in)"
log_warn "  4. Create 'B2C_1_password_reset' (Password reset)"
log_warn ""
log_info "Next Steps:"
log_info "  1. Verify configuration: ./verify-b2c.sh"
log_info "  2. Proceed to Stage 5: Application Deployment"
log_info ""