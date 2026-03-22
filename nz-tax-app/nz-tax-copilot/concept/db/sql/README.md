# Stage 12: SQL Schema

## Overview

This stage creates the SQL database schema for the NZ Tax Copilot prototype. It includes all tables for user data, income entries, crypto transactions, documents, audit logs, and IR3 calculations.

## Prerequisites

- Stage 1 (Foundation) deployed — provides resource group
- Stage 5 (SQL Database) deployed — provides SQL Server and Database
- Azure CLI logged in with appropriate permissions
- SQL admin Entra ID group configured in SQL Server

## Tables Created

### Core Tables

| Table | Purpose |
|-------|---------|
| `Users` | User profile information (linked to Azure AD B2C) |
| `Income` | Income entries for tax workspaces |
| `CryptoTransactions` | Cryptocurrency buy/sell transactions |
| `Documents` | Document metadata (links to Blob Storage) |
| `IR3Calculations` | Cached IR3 calculation results |
| `AuditLog` | Audit trail for all user actions |
| `CalculationCache` | Cache for expensive calculations |

### Reference Tables

| Table | Purpose |
|-------|---------|
| `IncomeTypeMappings` | Maps income types to IR3 box codes |
| `IR3BoxCodes` | IR3 box code descriptions and IRD guidance URLs |

## Authentication

All schema deployment uses **Entra ID authentication** via `az sql db query --auth-type ActiveDirectoryDefault`.

**No SQL username/password is required.** The user executing `deploy.sh` must be:
- Logged into Azure CLI with `az login`
- Member of the SQL admin Entra ID group configured in Stage 5

## Deployment

### Option 1: Raw SQL Script (Recommended for POC)

```bash
cd concept/db/sql
chmod +x deploy.sh
./deploy.sh