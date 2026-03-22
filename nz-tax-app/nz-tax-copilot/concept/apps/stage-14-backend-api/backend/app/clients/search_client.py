from azure.search.documents.aio import SearchClient as AzureSearchClient
from azure.search.documents.models import VectorizedQuery
from functools import lru_cache
from typing import List, Dict, Any
from .credential_provider import get_credential
from ..core.config import get_settings
import logging

logger = logging.getLogger(__name__)

@lru_cache()
def get_search_client() -> AzureSearchClient:
    """
    Get AI Search client with managed identity authentication.
    
    Returns:
        SearchClient: Async search client
    """
    settings = get_settings()
    credential = get_credential()
    
    client = AzureSearchClient(
        endpoint=settings.AI_SEARCH_ENDPOINT,
        index_name=settings.AI_SEARCH_INDEX,
        credential=credential
    )
    
    logger.info(f"AI Search client initialized: {settings.AI_SEARCH_ENDPOINT}/{settings.AI_SEARCH_INDEX}")
    return client

class SearchRepository:
    """
    Repository pattern for AI Search operations.
    """
    
    def __init__(self):
        self.client = get_search_client()
        self.settings = get_settings()
    
    async def vector_search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filter_expr: str | None = None
    ) -> List[Dict[str, Any]]:
        """
        Perform vector search on IRD guidance index.
        
        Args:
            query_vector: Embedding vector (1536 dimensions)
            top_k: Number of results to return
            filter_expr: OData filter expression
        
        Returns:
            List of search results with content and metadata
        """
        vector_query = VectorizedQuery(
            vector=query_vector,
            k_nearest_neighbors=top_k,
            fields="chunk_embedding"
        )
        
        results = []
        async for result in self.client.search(
            search_text=None,
            vector_queries=[vector_query],
            filter=filter_expr,
            select=["chunk_id", "document_title", "document_url", "section_title", "chunk_text"],
            top=top_k
        ):
            results.append({
                "chunkId": result["chunk_id"],
                "documentTitle": result["document_title"],
                "documentUrl": result["document_url"],
                "sectionTitle": result["section_title"],
                "chunkText": result["chunk_text"],
                "relevanceScore": result.get("@search.score", 0)
            })
        
        logger.info(f"Vector search returned {len(results)} results")
        return results