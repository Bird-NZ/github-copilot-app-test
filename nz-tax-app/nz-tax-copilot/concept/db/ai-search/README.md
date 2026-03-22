# Stage 13: AI Search Index Schema

## Overview

This stage defines the Azure AI Search index schema for IRD guidance documents. The index supports:
- **Vector search** using HNSW algorithm with 1536-dimension embeddings (text-embedding-ada-002)
- **Hybrid search** combining vector similarity with keyword search (BM25)
- **Semantic ranking** to improve result relevance
- **Faceted search** by tax year, category, and document title

## Index Schema

### Key Fields

| Field | Type | Purpose |
|-------|------|---------|
| `id` | String | Unique identifier (primary key) |
| `chunk_id` | String | Chunk identifier (document_id + chunk_index) |
| `document_id` | String | Source document identifier |
| `document_title` | String | Document name (e.g., "IR3 Guide 2024") |
| `document_url` | String | Public IRD URL for source document |
| `section_title` | String | Section heading within document |
| `chunk_text` | String | Text content of chunk (500-1000 tokens) |
| `chunk_embedding` | Vector (1536) | Text embedding from text-embedding-ada-002 |
| `tax_year` | String | Applicable tax year (e.g., "2024") |
| `category` | String | Guidance category (crypto, self-employment, rental-income, etc.) |
| `last_updated` | DateTimeOffset | Document publication date |
| `chunk_index` | Int32 | Sequential chunk number within document |

### Vector Search Configuration

**Algorithm**: HNSW (Hierarchical Navigable Small World)
- **Metric**: Cosine similarity (standard for OpenAI embeddings)
- **m**: 4 (number of bi-directional links per node)
- **efConstruction**: 400 (candidate pool size during index build)
- **efSearch**: 500 (candidate pool size during query)

**Embedding Model**: text-embedding-ada-002 (1536 dimensions)

### Semantic Configuration

**Profile**: `ird-semantic-config`
- **Title field**: `document_title` (primary semantic relevance signal)
- **Content fields**: `chunk_text` (main content for semantic ranking)
- **Keywords fields**: `section_title`, `category` (additional context)

## Deployment

### Prerequisites

- Azure CLI installed and authenticated
- Stage 9 (AI Search service) deployed
- `jq` installed for JSON processing

### Deploy Index

```bash
cd concept/db/ai-search
./deploy.sh