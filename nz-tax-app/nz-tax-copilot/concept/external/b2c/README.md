# Azure AD B2C Configuration for NZ Tax Copilot

This directory contains configuration and setup scripts for the Azure AD B2C tenant used for user authentication in the NZ Tax Copilot prototype.

## What is Azure AD B2C?

Azure Active Directory B2C (Azure AD B2C) is a consumer identity management service that enables external user authentication with social providers (Google, Microsoft, Facebook) or email/password. It is deployed as a **separate tenant** outside your Azure subscription.

## Why Manual Setup?

Azure AD B2C tenants cannot be created via Terraform or Bicep. They must be provisioned through the Azure Portal following Microsoft's B2C tenant creation wizard. Once created, this directory provides automation for:
- App registrations (API and frontend clients)
- User flows (sign-up/sign-in, password reset)
- Configuration validation

## Prerequisites

1. **Azure Subscription**: You need at least Contributor access to create a B2C tenant (linked to your subscription for billing)
2. **Azure CLI**: Version 2.50.0 or higher with the `az ad` extension
3. **Global Administrator**: You must have Global Administrator rights in the Azure AD tenant where B2C will be created

## Manual Setup Steps

### Step 1: Create the B2C Tenant

1. Navigate to the Azure Portal: https://portal.azure.com
2. Search for "Azure AD B2C" in the top search bar
3. Click **Create a new Azure AD B2C Tenant**
4. Select **Create a new Azure AD B2C Tenant**
5. Fill in the tenant details:
   - **Organization name**: `NZ Tax Copilot`
   - **Initial domain name**: `nztaxcopilot` (this becomes `nztaxcopilot.onmicrosoft.com`)
   - **Country/Region**: `New Zealand`
   - **Subscription**: Select your Azure subscription (for billing)
   - **Resource group**: `zd-rg-tax-dev-aue` (use existing from Stage 1)
6. Click **Review + create** → **Create**
7. Wait 2-5 minutes for tenant provisioning

### Step 2: Switch to the B2C Tenant

After creation, you need to **switch your Azure Portal context** to the new B2C tenant:

1. Click your profile picture (top-right corner)
2. Click **Switch directory**
3. Select the **NZ Tax Copilot** directory from the list
4. Confirm you see "Azure AD B2C" in the left navigation menu

### Step 3: Run the Setup Script

From this directory, run the automated setup script:

```bash
./setup-b2c.sh