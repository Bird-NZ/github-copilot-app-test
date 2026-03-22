# Stage 16: IRD Guidance Data Ingestion

## Overview

This stage populates the Azure AI Search `ird-guidance` index with IRD guidance documents for the Retrieval-Augmented Generation (RAG) system. The ingestion pipeline extracts text from PDF documents, chunks them into semantic segments, generates embeddings using Azure OpenAI, and uploads the chunks to AI Search.

## Prerequisites

- Stages 8, 9, 13, and 14 deployed successfully
- IRD guidance PDF documents available in `../../data/ird-guidance/` directory
- Azure CLI authenticated with appropriate permissions
- Python 3.11+ installed

## IRD Documents Required

Place the following IRD guidance documents in `../../data/ird-guidance/`:

1. `IR3-Guide-2024.pdf` — Individual income tax return guide
2. `Crypto-Tax-Guidance-2024.pdf` — Tax on cryptocurrency
3. `Self-Employment-Guide-2024.pdf` — Self-employment income and expenses
4. `Rental-Income-Guide-2024.pdf` — Rental property income guide (optional)
5. `Overseas-Income-Guide-2024.pdf` — Foreign income guide (optional)

Download from: https://www.ird.govt.nz/

## Deployment

### Step 1: Prepare IRD Documents

```bash
# Create directory for IRD documents
mkdir -p ../../data/ird-guidance

# Download IRD guidance PDFs from ird.govt.nz
# (Manual step — place downloaded PDFs in data/ird-guidance/)