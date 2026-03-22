#!/usr/bin/env python3
"""
AI Search Index Query Test Script

Tests vector search, hybrid search, and semantic ranking against the
'ird-guidance' index.

Prerequisites:
- Stage 9 (AI Search service) deployed
- Stage 13 (AI Search index) deployed
- Stage 14 (Index population) deployed
- Azure CLI authenticated

Usage:
    python query_test.py "How do I report crypto capital gains?"
"""

import sys
import json
import os
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery
from openai import AzureOpenAI

def load_outputs():
    """Load outputs from Stage 9 and Stage 13."""
    with open("outputs.json") as f:
        stage13_outputs = json.load(f)
    
    with open("../9-ai-search/outputs.json") as f:
        stage9_outputs = json.load(f)
    
    with open("../8-azure-openai/outputs.json") as f:
        stage8_outputs = json.load(f)
    
    return {
        "search_service": stage13_outputs["search_service_name"]["value"],
        "index_name": stage13_outputs["search_index_name"]["value"],
        "openai_endpoint": stage8_outputs["openai_endpoint"]["value"],
        "embedding_model": stage8_outputs["embedding_deployment_name"]["value"]
    }

def create_search_client(service_name: str, index_name: str) -> SearchClient:
    """Create AI Search client with managed identity."""
    credential = DefaultAzureCredential()
    endpoint = f"https://{service_name}.search.windows.net"
    
    return SearchClient(
        endpoint=endpoint,
        index_name=index_name,
        credential=credential
    )

def create_openai_client(endpoint: str) -> AzureOpenAI:
    """Create Azure OpenAI client with managed identity."""
    from azure.identity import get_bearer_token_provider
    
    credential = DefaultAzureCredential()
    token_provider = get_bearer_token_provider(
        credential,
        "https://cognitiveservices.azure.com/.default"
    )
    
    return AzureOpenAI(
        azure_endpoint=endpoint,
        azure_ad_token_provider=token_provider,
        api_version="2024-02-01"
    )

def generate_embedding(client: AzureOpenAI, model: str, text: str) -> list:
    """Generate embedding for query text."""
    response = client.embeddings.create(
        model=model,
        input=text
    )
    return response.data[0].embedding

def test_vector_search(client: SearchClient, query_embedding: list):
    """Test pure vector search."""
    print("\n=== VECTOR SEARCH (Top 3) ===\n")
    
    vector_query = VectorizedQuery(
        vector=query_embedding,
        k_nearest_neighbors=3,
        fields="chunk_embedding"
    )
    
    results = client.search(
        search_text=None,
        vector_queries=[vector_query],
        filter="tax_year eq '2024'",
        select=["chunk_text", "document_title", "section_title", "document_url"],
        top=3
    )
    
    for i, result in enumerate(results, 1):
        print(f"Result {i}:")
        print(f"  Title: {result['document_title']}")
        print(f"  Section: {result['section_title']}")
        print(f"  URL: {result['document_url']}")
        print(f"  Score: {result['@search.score']:.4f}")
        print(f"  Text: {result['chunk_text'][:200]}...")
        print()

def test_hybrid_search(client: SearchClient, query_text: str, query_embedding: list):
    """Test hybrid search (vector + keyword)."""
    print("\n=== HYBRID SEARCH (Vector + Keyword) ===\n")
    
    vector_query = VectorizedQuery(
        vector=query_embedding,
        k_nearest_neighbors=3,
        fields="chunk_embedding"
    )
    
    results = client.search(
        search_text=query_text,  # Keyword component
        vector_queries=[vector_query],  # Vector component
        filter="category eq 'crypto'",
        select=["chunk_text", "document_title", "section_title", "category"],
        top=3
    )
    
    for i, result in enumerate(results, 1):
        print(f"Result {i}:")
        print(f"  Title: {result['document_title']}")
        print(f"  Section: {result['section_title']}")
        print(f"  Category: {result['category']}")
        print(f"  Score: {result['@search.score']:.4f}")
        print(f"  Text: {result['chunk_text'][:200]}...")
        print()

def test_semantic_search(client: SearchClient, query_text: str, query_embedding: list):
    """Test semantic search with reranking."""
    print("\n=== SEMANTIC SEARCH (with Reranking) ===\n")
    
    vector_query = VectorizedQuery(
        vector=query_embedding,
        k_nearest_neighbors=10,  # Retrieve more for reranking
        fields="chunk_embedding"
    )
    
    results = client.search(
        search_text=query_text,
        vector_queries=[vector_query],
        query_type="semantic",
        semantic_configuration_name="ird-semantic-config",
        select=["chunk_text", "document_title", "section_title"],
        top=3
    )
    
    for i, result in enumerate(results, 1):
        print(f"Result {i}:")
        print(f"  Title: {result['document_title']}")
        print(f"  Section: {result['section_title']}")
        print(f"  Semantic Score: {result.get('@search.reranker_score', 'N/A')}")
        print(f"  Vector Score: {result['@search.score']:.4f}")
        print(f"  Text: {result['chunk_text'][:200]}...")
        print()

def main():
    """Main test execution."""
    if len(sys.argv) < 2:
        print("Usage: python query_test.py 'your search query'")
        print("Example: python query_test.py 'How do I report crypto capital gains?'")
        sys.exit(1)
    
    query_text = sys.argv[1]
    
    print(f"\nQuery: {query_text}\n")
    print("=" * 60)
    
    # Load configuration
    config = load_outputs()
    
    # Initialize clients
    print("Initializing Azure clients...")
    search_client = create_search_client(
        config["search_service"],
        config["index_name"]
    )
    
    openai_client = create_openai_client(config["openai_endpoint"])
    
    # Generate query embedding
    print("Generating query embedding...")
    query_embedding = generate_embedding(
        openai_client,
        config["embedding_model"],
        query_text
    )
    
    # Run tests
    test_vector_search(search_client, query_embedding)
    test_hybrid_search(search_client, query_text, query_embedding)
    
    try:
        test_semantic_search(search_client, query_text, query_embedding)
    except Exception as e:
        print(f"\nNote: Semantic search not available (requires Standard tier): {e}")
    
    print("\n" + "=" * 60)
    print("Query tests complete.\n")

if __name__ == "__main__":
    main()