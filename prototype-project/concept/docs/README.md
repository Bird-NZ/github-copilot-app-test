# Hello World Azure Function Prototype

A minimal serverless Azure Functions application demonstrating managed identity authentication, blob storage writes, and Application Insights telemetry.

## Overview

This prototype showcases three core Azure patterns:

1. **Serverless Compute**: Azure Functions Consumption plan with automatic scaling
2. **Managed Identity Authentication**: Zero-credential authentication to Azure Storage
3. **Secure Storage Access**: RBAC-enforced blob writes with disabled shared keys

Each HTTP GET request to `/api/hello` returns "Hello World" and creates a timestamped JSON blob in Azure Storage.

## Architecture

```mermaid
graph TB
    Client[HTTP Client] -->|GET /api/hello| Function[Azure Function<br/>zd-func-helloworld-dev-aue]
    Function -->|Managed Identity Auth| Storage[Storage Account<br/>zdsthelloworlddevaue]
    Function -.->|Telemetry| AppInsights[Application Insights<br/>zd-appi-helloworld-dev-aue]
    Storage -->|Write| Container[function-output<br/>Container]