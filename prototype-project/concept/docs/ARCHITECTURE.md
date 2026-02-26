# Architecture Guide

This document describes the architecture of the hello-world Azure Functions prototype, including service topology, data flows, security patterns, and design decisions.

## Solution Overview

The hello-world prototype is a minimal serverless application demonstrating:

1. **Serverless HTTP endpoint** (Azure Functions Consumption plan)
2. **Managed identity authentication** (zero-credential access to storage)
3. **Secure blob storage** (RBAC-enforced writes with disabled shared keys)
4. **Distributed telemetry** (Application Insights auto-instrumentation)

Each HTTP GET request triggers:
- Return "Hello World" response to client
- Create JSON blob in storage with request metadata
- Log telemetry to Application Insights

**Design Philosophy**: This is explicitly a **learning prototype**, not a production-ready solution. It prioritizes simplicity and cost efficiency over high availability and enterprise security patterns.

## Service Topology

```mermaid
graph TB
    subgraph "External"
        Client[HTTP Client<br/>curl/browser]
    end
    
    subgraph "Azure - Australia East"
        subgraph "zd-rg-helloworld-dev-aue"
            
            subgraph "Compute Layer"
                Function[zd-func-helloworld-dev-aue<br/>Function App<br/>Python 3.12<br/>Consumption Y1]
                Identity[User-Assigned Identity<br/>zd-id-helloworld-dev-aue]
            end
            
            subgraph "Storage Layer"
                Storage[zdsthelloworlddevaue<br/>Standard LRS<br/>Shared Key: Disabled]
                Container[function-output<br/>Blob Container]
            end
            
            subgraph "Monitoring Layer"
                AppInsights[zd-appi-helloworld-dev-aue<br/>Application Insights<br/>90-day retention]
                LogWS[zd-log-helloworld-dev-aue<br/>Log Analytics<br/>90-day retention]
            end
        end
        
        subgraph "Azure Platform Services"
            EntraID[Microsoft Entra ID<br/>Token Service]
            RBAC[Azure RBAC<br/>Storage Blob Data Contributor]
        end
    end
    
    Client -->|"1. GET /api/hello"| Function
    Function -->|"2. Return 'Hello World'"| Client
    Function -.->|"3. Request token"| EntraID
    EntraID -.->|"4. Issue JWT"| Function
    Function -->|"5. PUT blob (bearer token)"| Storage
    Storage -->|"6. Validate via RBAC"| RBAC
    Storage -->|"7. Write blob"| Container
    Function -.->|"Telemetry"| AppInsights
    AppInsights -.->|"Store logs"| LogWS
    
    classDef compute fill:#0078d4,stroke:#004578,color:#fff
    classDef storage fill:#00a4ef,stroke:#007acc,color:#fff
    classDef monitor fill:#7fba00,stroke:#5a9a00,color:#fff
    classDef identity fill:#ff6b00,stroke:#cc5500,color:#fff
    classDef external fill:#e3e3e3,stroke:#999,color:#000
    
    class Function,Identity compute
    class Storage,Container storage
    class AppInsights,LogWS monitor
    class EntraID,RBAC identity
    class Client external