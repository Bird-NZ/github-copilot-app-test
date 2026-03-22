#!/usr/bin/env python3
"""
AI Search Index Population Script

Chunks IRD guidance documents, generates embeddings with Azure OpenAI,
and uploads to AI Search index for RAG-based guidance queries.

Usage:
    python populate_index.py \
        --search-service zd-search-tax-dev-aue \
        --index-name ird-guidance \
        --documents-path ../../data/ird-guidance/*.pdf \
        --openai-endpoint https://zd-openai-tax-dev-aue.openai.azure.com
"""

import argparse
import asyncio
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict
import json

import PyPDF2
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from openai import AzureOpenAI

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class DocumentChunker:
    """Chunk documents into semantic segments with overlap."""
    
    def __init__(self, chunk_size: int = 1000, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk_text(self, text: str, title: str, source_url: str) -> List[Dict]:
        """
        Chunk text into overlapping segments.
        
        Args:
            text: Full document text
            title: Document title
            source_url: Source URL for citation
        
        Returns:
            List of chunk dictionaries with metadata
        """
        words = text.split()
        chunks = []
        chunk_index = 0
        
        for i in range(0, len(words), self.chunk_size - self.overlap):
            chunk_words = words[i:i + self.chunk_size]
            chunk_text = ' '.join(chunk_words)
            
            if len(chunk_text.strip()) > 100:  # Skip tiny chunks
                chunks.append({
                    'chunk_index': chunk_index,
                    'content': chunk_text,
                    'title': title,
                    'source_url': source_url
                })
                chunk_index += 1
        
        logger.info(f"Chunked '{title}' into {len(chunks)} chunks")
        return chunks


class PDFExtractor:
    """Extract text from PDF files."""
    
    @staticmethod
    def extract_text(pdf_path: Path) -> str:
        """
        Extract text from PDF file.
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            Extracted text content
        """
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ''
                for page in reader.pages:
                    text += page.extract_text() + '\n'
                
                logger.info(f"Extracted {len(text)} characters from {pdf_path.name}")
                return text
        except Exception as e:
            logger.error(f"Failed to extract text from {pdf_path}: {e}")
            return ''


class EmbeddingGenerator:
    """Generate embeddings using Azure OpenAI."""
    
    def __init__(self, openai_endpoint: str, model: str = "text-embedding-ada-002"):
        self.credential = DefaultAzureCredential()
        self.client = AzureOpenAI(
            azure_endpoint=openai_endpoint,
            azure_ad_token_provider=self._get_token_provider(),
            api_version="2024-02-01"
        )
        self.model = model
    
    def _get_token_provider(self):
        """Get token provider for Azure OpenAI authentication."""
        from azure.identity import get_bearer_token_provider
        return get_bearer_token_provider(
            self.credential,
            "https://cognitiveservices.azure.com/.default"
        )
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a batch of texts.
        
        Args:
            texts: List of text strings to embed
        
        Returns:
            List of embedding vectors (1536-dimensional)
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            
            embeddings = [data.embedding for data in response.data]
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise


class IndexPopulator:
    """Populate AI Search index with documents."""
    
    def __init__(self, search_service: str, index_name: str):
        self.credential = DefaultAzureCredential()
        self.search_endpoint = f"https://{search_service}.search.windows.net"
        self.index_name = index_name
        
        self.index_client = SearchIndexClient(
            endpoint=self.search_endpoint,
            credential=self.credential
        )
        
        self.search_client = SearchClient(
            endpoint=self.search_endpoint,
            index_name=self.index_name,
            credential=self.credential
        )
    
    async def upload_documents(self, documents: List[Dict]) -> None:
        """
        Upload documents to AI Search index.
        
        Args:
            documents: List of document dictionaries with embeddings
        """
        try:
            result = self.search_client.upload_documents(documents=documents)
            
            succeeded = sum(1 for r in result if r.succeeded)
            failed = len(result) - succeeded
            
            logger.info(f"Uploaded {succeeded} documents, {failed} failed")
            
            if failed > 0:
                for r in result:
                    if not r.succeeded:
                        logger.error(f"Failed to upload document {r.key}: {r.error_message}")
                        
        except Exception as e:
            logger.error(f"Failed to upload documents: {e}")
            raise


async def main():
    parser = argparse.ArgumentParser(description='Populate AI Search index with IRD guidance documents')
    parser.add_argument('--search-service', required=True, help='AI Search service name')
    parser.add_argument('--index-name', required=True, help='Index name')
    parser.add_argument('--documents-path', required=True, help='Path to PDF documents (glob pattern)')
    parser.add_argument('--openai-endpoint', required=True, help='Azure OpenAI endpoint URL')
    parser.add_argument('--chunk-size', type=int, default=1000, help='Chunk size in tokens (default: 1000)')
    parser.add_argument('--overlap', type=int, default=100, help='Chunk overlap in tokens (default: 100)')
    parser.add_argument('--batch-size', type=int, default=100, help='Upload batch size (default: 100)')
    
    args = parser.parse_args()
    
    # Initialize components
    chunker = DocumentChunker(chunk_size=args.chunk_size, overlap=args.overlap)
    extractor = PDFExtractor()
    embedding_gen = EmbeddingGenerator(openai_endpoint=args.openai_endpoint)
    populator = IndexPopulator(search_service=args.search_service, index_name=args.index_name)
    
    # Find all PDF files
    pdf_files = list(Path().glob(args.documents_path))
    if not pdf_files:
        logger.error(f"No PDF files found matching: {args.documents_path}")
        sys.exit(1)
    
    logger.info(f"Found {len(pdf_files)} PDF files")
    
    all_chunks = []
    
    # Process each PDF
    for pdf_path in pdf_files:
        logger.info(f"Processing {pdf_path.name}")
        
        # Extract text
        text = extractor.extract_text(pdf_path)
        if not text:
            logger.warning(f"Skipping {pdf_path.name} - no text extracted")
            continue
        
        # Chunk text
        title = pdf_path.stem.replace('-', ' ').replace('_', ' ')
        source_url = f"https://www.ird.govt.nz/documents/{pdf_path.name}"
        
        chunks = chunker.chunk_text(
            text=text,
            title=title,
            source_url=source_url
        )
        
        all_chunks.extend(chunks)
    
    logger.info(f"Total chunks: {len(all_chunks)}")
    
    # Generate embeddings in batches
    logger.info("Generating embeddings...")
    batch_size = args.batch_size
    
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i:i + batch_size]
        texts = [chunk['content'] for chunk in batch]
        
        embeddings = await embedding_gen.generate_embeddings(texts)
        
        # Add embeddings to chunks
        for chunk, embedding in zip(batch, embeddings):
            chunk['content_vector'] = embedding
        
        logger.info(f"Processed batch {i // batch_size + 1}/{(len(all_chunks) + batch_size - 1) // batch_size}")
    
    # Upload to AI Search
    logger.info("Uploading documents to AI Search...")
    
    # Add required fields
    documents_to_upload = []
    for idx, chunk in enumerate(all_chunks):
        documents_to_upload.append({
            'id': f"doc_{idx:06d}",
            'content': chunk['content'],
            'title': chunk['title'],
            'source_url': chunk['source_url'],
            'chunk_index': chunk['chunk_index'],
            'content_vector': chunk['content_vector'],
            'category': 'general',  # Could be inferred from document title
            'tax_year': '2024',     # Could be extracted from document
            'last_updated': datetime.utcnow().isoformat()
        })
    
    # Upload in batches
    for i in range(0, len(documents_to_upload), batch_size):
        batch = documents_to_upload[i:i + batch_size]
        await populator.upload_documents(batch)
        logger.info(f"Uploaded batch {i // batch_size + 1}/{(len(documents_to_upload) + batch_size - 1) // batch_size}")
    
    logger.info(f"✅ Successfully populated index with {len(documents_to_upload)} documents")


if __name__ == '__main__':
    asyncio.run(main())