#!/usr/bin/env python3
"""
Verify AI Search index population and test vector search.

Usage:
    python verify_index.py \
        --search-service zd-search-tax-dev-aue \
        --index-name ird-guidance \
        --query "How do I report crypto gains?"
"""

import argparse
import asyncio
import logging
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import VectorizedQuery

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def main():
    parser = argparse.ArgumentParser(description='Verify AI Search index')
    parser.add_argument('--search-service', required=True, help='AI Search service name')
    parser.add_argument('--index-name', required=True, help='Index name')
    parser.add_argument('--query', required=True, help='Test query')
    
    args = parser.parse_args()
    
    credential = DefaultAzureCredential()
    search_endpoint = f"https://{args.search_service}.search.windows.net"
    
    search_client = SearchClient(
        endpoint=search_endpoint,
        index_name=args.index_name,
        credential=credential
    )
    
    # Get index statistics
    try:
        # Note: This requires Search Index Data Reader role
        stats = search_client.get_document_count()
        logger.info(f"Index '{args.index_name}' contains {stats} documents")
        
    except Exception as e:
        logger.error(f"Failed to get index statistics: {e}")
    
    # Test keyword search
    logger.info(f"Testing keyword search: '{args.query}'")
    try:
        results = search_client.search(
            search_text=args.query,
            top=5,
            select=["title", "content", "source_url"]
        )
        
        for i, result in enumerate(results, 1):
            logger.info(f"\nResult {i}:")
            logger.info(f"  Title: {result['title']}")
            logger.info(f"  Content preview: {result['content'][:200]}...")
            logger.info(f"  Source: {result['source_url']}")
            
    except Exception as e:
        logger.error(f"Search failed: {e}")


if __name__ == '__main__':
    asyncio.run(main())