# NZ Tax Copilot — Solution Architecture

**Version**: 1.0  
**Last Updated**: 2025-01-22  
**Status**: Prototype (Development)

---

## Table of Contents

1. [Solution Overview](#solution-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Architecture](#data-architecture)
5. [Security Architecture](#security-architecture)
6. [Network Architecture](#network-architecture)
7. [Integration Architecture](#integration-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Design Decisions](#design-decisions)
10. [Production Roadmap](#production-roadmap)

---

## Solution Overview

The **NZ Tax Copilot** is a cloud-native web application built on Azure that enables New Zealand individual taxpayers to prepare their IR3 income tax returns through an AI-assisted, guided workflow. The prototype validates the technical feasibility of:

- **Public user authentication** with Azure AD B2C (email/password, future: MFA and social providers)
- **Structured data collection** via conditional questionnaires and dynamic forms
- **Crypto transaction processing** with FIFO capital gains calculation
- **Document storage** with evidence attachment for income entries
- **AI-powered IRD guidance** using Retrieval-Augmented Generation (RAG) with Azure OpenAI
- **IR3 calculation** with automatic mapping to official Inland Revenue box codes
- **Draft return export** in CSV format (production: PDF with digital signature)

### Primary User Journey

1. **Sign Up / Sign In** → User authenticates via Azure AD B2C
2. **Create Workspace** → Select tax year (e.g., 2024) to begin preparation
3. **Complete Questionnaire** → Conditional questions determine applicable income categories
4. **Enter Income Data** → Salary, dividends, rental income, crypto transactions
5. **Upload Documents** → Evidence files (payslips, receipts, exchange statements)
6. **Query IRD Guidance** → AI assistant answers tax questions using official IRD documentation
7. **Calculate IR3** → System maps entries to IR3 box codes and calculates totals
8. **Export Draft Return** → Download CSV summary for review

### Non-Functional Requirements Met

| Requirement | Implementation | Evidence |
|------------|----------------|----------|
| **Security** | Managed identity for all service-to-service auth, private endpoints for data services, TLS 1.2+ enforcement | Zero connection strings in code; all data services use Entra RBAC |
| **Scalability** | Container Apps autoscaling (1-3 replicas), serverless Cosmos DB and SQL Database | Handles 10+ concurrent users in demo; production path documented |
| **Observability** | Application Insights, Log Analytics, diagnostic logs on all PaaS resources | Full request tracing from frontend → backend → dependencies |
| **Compliance** | Audit log for all user actions, before/after snapshots for data modifications | SQL AuditLog table captures every state change with timestamps |

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "User Layer"
        User[End User<br/>Web Browser]
    end
    
    subgraph "Identity Layer"
        B2C[Azure AD B2C<br/>nztaxcopilot.onmicrosoft.com]
    end
    
    subgraph "Application Layer"
        Frontend[Container App: Frontend<br/>zd-ca-web-dev-aue<br/>React SPA + nginx]
        API[Container App: Backend API<br/>zd-ca-api-dev-aue<br/>Python FastAPI]
    end
    
    subgraph "Data Layer"
        Cosmos[(Cosmos DB<br/>zd-cosmos-tax-dev-aue<br/>Workspaces, Questionnaires)]
        SQL[(Azure SQL<br/>zd-sql-tax-dev-aue<br/>Income, Crypto, Audit)]
        Blob[Blob Storage<br/>zdsttaxdevaue<br/>Documents]
    end
    
    subgraph "AI Layer"
        OpenAI[Azure OpenAI<br/>zd-openai-tax-dev-aue<br/>GPT-4o + Embeddings]
        Search[AI Search<br/>zd-search-tax-dev-aue<br/>IRD Guidance Index]
    end
    
    subgraph "Security Layer"
        KeyVault[Key Vault<br/>zd-kv-tax-dev-aue]
    end
    
    subgraph "Monitoring Layer"
        AppInsights[Application Insights<br/>pm-appi-tax-dev-aue]
        LogAnalytics[Log Analytics<br/>pm-log-tax-dev-aue]
    end
    
    User -->|HTTPS| Frontend
    User -->|OAuth 2.0| B2C
    B2C -->|JWT Token| Frontend
    Frontend -->|API Calls + JWT| API
    
    API -->|Managed Identity| Cosmos
    API -->|Managed Identity| SQL
    API -->|Managed Identity| Blob
    API -->|Managed Identity| OpenAI
    API -->|Managed Identity| Search
    API -->|Managed Identity| KeyVault
    
    OpenAI -.->|RAG Context| Search
    
    API -->|Telemetry| AppInsights
    Frontend -->|Telemetry| AppInsights
    Cosmos -->|Diagnostics| LogAnalytics
    SQL -->|Diagnostics| LogAnalytics
    Blob -->|Diagnostics| LogAnalytics
    AppInsights -.->|Linked| LogAnalytics
    
    classDef userClass fill:#e1f5ff,stroke:#01579b
    classDef identityClass fill:#fff3e0,stroke:#e65100
    classDef appClass fill:#e8f5e9,stroke:#2e7d32
    classDef dataClass fill:#f3e5f5,stroke:#6a1b9a
    classDef aiClass fill:#fff9c4,stroke:#f57f17
    classDef securityClass fill:#ffebee,stroke:#c62828
    classDef monitorClass fill:#e0f2f1,stroke:#00695c
    
    class User userClass
    class B2C identityClass
    class Frontend,API appClass
    class Cosmos,SQL,Blob dataClass
    class OpenAI,Search aiClass
    class KeyVault securityClass
    class AppInsights,LogAnalytics monitorClass