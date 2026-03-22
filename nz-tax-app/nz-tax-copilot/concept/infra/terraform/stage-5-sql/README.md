# Stage 5: SQL Database

This stage deploys Azure SQL Server and Database for the NZ Tax Copilot audit trail and relational data storage.

## Resources Created

- **Azure SQL Server** (`zd-sql-tax-dev-aue`)
  - SKU: Serverless, General Purpose, Gen5
  - Authentication: Microsoft Entra ID only (SQL authentication disabled)
  - Network: Private endpoint in `snet-data` subnet
  - TLS: 1.2 minimum enforced
  - Threat Protection: Enabled

- **SQL Database** (`TaxCopilotDB`)
  - SKU: GP_S_Gen5_2 (Serverless, 0.5-2 vCores, auto-pause after 1 hour)
  - Storage: 32 GB (auto-grow disabled for cost control)
  - Backup: 7-day point-in-time restore (locally redundant)
  - Encryption: Transparent Data Encryption (TDE) enabled

- **Private Endpoint** (`pe-sql-tax-dev-aue`)
  - Subnet: `snet-data` (from Stage 2)
  - DNS Zone: `privatelink.database.windows.net` (from Stage 2)
  - Connection: Auto-approved

- **Diagnostic Settings**
  - SQL Server: Security audit events, DevOps operations audit, all metrics → Log Analytics
  - SQL Database: SQLInsights, QueryStoreRuntimeStatistics, Errors, Timeouts, Blocks, Deadlocks → Log Analytics

## Prerequisites

- **Stage 1 (Foundation)** completed: Resource group, Log Analytics workspace, Application Insights
- **Stage 2 (Networking)** completed: VNET, subnets, private DNS zones, NSGs
- **Azure AD Group**: SQL admin group created with Object ID available

## Required Variables

Set the following environment variable before deployment:

```bash
export TF_VAR_sql_admin_group_id=$(az ad group show --group nz-tax-copilot-sql-admins --query id -o tsv)