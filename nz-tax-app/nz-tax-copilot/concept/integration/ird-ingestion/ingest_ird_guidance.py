#!/usr/bin/env python3
"""
Stage 16: IRD Guidance Data Ingestion Pipeline

Purpose: Ingest IRD guidance documents into Azure AI Search vector index.

Process:
1. Extract text from IRD PDF documents
2. Chunk documents into semantic segments (500-1000 tokens, 100-token overlap)
3. Generate embeddings using Azure OpenAI text-embedding-ada-002
4. Upload chunks with embeddings to AI Search index

Authentication: Uses managed identity (Container App or developer credentials)
Execution: Run inside Container App via kubectl exec, or locally with az login
"""

import os
import sys
import json
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Tuple
from datetime import datetime
import hashlib

# Azure SDK imports
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from azure.search.documents.models import IndexDocumentsBatch
from openai import AsyncAzureOpenAI

# Document processing imports
try:
    import PyPDF2
    from langchain.text_splitter import RecursiveCharacterTextSplitter
except ImportError:
    print("ERROR: Required libraries not installed. Run: pip install PyPDF2 langchain openai azure-search-documents azure-identity")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration from environment variables (set by deploy.sh from Terraform outputs)
OPENAI_ENDPOINT = os.getenv("OPENAI_ENDPOINT")
OPENAI_MODEL_NAME = os.getenv("OPENAI_MODEL_NAME", "text-embedding-ada-002")
SEARCH_ENDPOINT = os.getenv("SEARCH_ENDPOINT")
SEARCH_INDEX_NAME = os.getenv("SEARCH_INDEX_NAME", "ird-guidance")
IRD_DOCUMENTS_PATH = os.getenv("IRD_DOCUMENTS_PATH", "../../data/ird-guidance")
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "100"))
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "5"))

# Validate configuration
if not OPENAI_ENDPOINT or not SEARCH_ENDPOINT:
    logger.error("Missing required environment variables: OPENAI_ENDPOINT, SEARCH_ENDPOINT")
    sys.exit(1)


class IRDDocumentProcessor:
    """Process IRD guidance documents for AI Search indexing."""
    
    def __init__(self):
        # Initialize Azure SDK clients with managed identity
        self.credential = DefaultAzureCredential()
        
        # Azure OpenAI client for embedding generation
        self.openai_client = AsyncAzureOpenAI(
            azure_endpoint=OPENAI_ENDPOINT,
            api_version="2024-02-01",
            azure_ad_token_provider=self._get_token_provider()
        )
        
        # AI Search client for index upload
        self.search_client = SearchClient(
            endpoint=SEARCH_ENDPOINT,
            index_name=SEARCH_INDEX_NAME,
            credential=self.credential
        )
        
        # Text splitter for semantic chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=lambda text: len(text.split()),
            separators=["\n## ", "\n### ", "\n#### ", "\n\n", "\n", ". ", " ", ""]
        )
        
        logger.info(f"Initialized IRD document processor")
        logger.info(f"  OpenAI endpoint: {OPENAI_ENDPOINT}")
        logger.info(f"  Search endpoint: {SEARCH_ENDPOINT}")
        logger.info(f"  Search index: {SEARCH_INDEX_NAME}")
    
    def _get_token_provider(self):
        """Create token provider for Azure OpenAI authentication."""
        from azure.identity import get_bearer_token_provider
        return get_bearer_token_provider(
            self.credential,
            "https://cognitiveservices.azure.com/.default"
        )
    
    def extract_text_from_pdf(self, pdf_path: Path) -> str:
        """
        Extract text content from PDF file.
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            Extracted text content
        """
        logger.info(f"Extracting text from {pdf_path.name}")
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text_content = ""
            
            for page_num, page in enumerate(pdf_reader.pages):
                text_content += page.extract_text()
                
            logger.info(f"  Extracted {len(text_content)} characters from {len(pdf_reader.pages)} pages")
            return text_content
    
    def extract_document_metadata(self, pdf_path: Path) -> Dict:
        """
        Extract metadata from PDF filename and content.
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            Document metadata dictionary
        """
        # Parse filename to infer metadata
        # Expected format: IR3-Guide-2024.pdf, Crypto-Tax-Guidance-2024.pdf
        filename = pdf_path.stem
        parts = filename.split('-')
        
        # Infer document ID and title
        if filename.startswith("IR3"):
            document_id = "IR3G-2024"
            document_title = "IR3 Guide 2024"
            document_url = "https://www.ird.govt.nz/income-tax/income-tax-for-individuals/what-happens-at-the-end-of-the-tax-year/ir3"
            category = "general"
        elif "Crypto" in filename or "Cryptocurrency" in filename:
            document_id = "CRYPTO-2024"
            document_title = "Tax on Cryptocurrency"
            document_url = "https://www.ird.govt.nz/crypto"
            category = "crypto"
        elif "Self" in filename and "Employment" in filename:
            document_id = "SE-2024"
            document_title = "Self-Employment Guide"
            document_url = "https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/types-of-business-structures/self-employed-people"
            category = "self-employment"
        else:
            document_id = hashlib.md5(filename.encode()).hexdigest()[:12].upper()
            document_title = filename.replace('-', ' ')
            document_url = f"https://www.ird.govt.nz/{filename.lower()}"
            category = "general"
        
        # Extract tax year from filename
        tax_year = "2024"
        for part in parts:
            if part.isdigit() and len(part) == 4:
                tax_year = part
                break
        
        return {
            "document_id": document_id,
            "document_title": document_title,
            "document_url": document_url,
            "tax_year": tax_year,
            "category": category,
            "last_updated": datetime.now().isoformat()
        }
    
    def chunk_document(
        self,
        document_text: str,
        metadata: Dict
    ) -> List[Dict]:
        """
        Chunk document into semantic segments.
        
        Args:
            document_text: Full text content
            metadata: Document metadata
        
        Returns:
            List of chunk dictionaries
        """
        logger.info(f"Chunking document: {metadata['document_title']}")
        
        # Split text into chunks
        chunks = self.text_splitter.split_text(document_text)
        
        # Build chunk documents with metadata
        chunk_documents = []
        for idx, chunk_text in enumerate(chunks):
            chunk_id = f"{metadata['document_id']}_chunk_{idx:03d}"
            
            # Infer section title from chunk content (first heading line)
            section_title = self._extract_section_title(chunk_text)
            
            chunk_documents.append({
                "chunk_id": chunk_id,
                "document_id": metadata["document_id"],
                "document_title": metadata["document_title"],
                "document_url": metadata["document_url"],
                "section_title": section_title,
                "chunk_text": chunk_text,
                "tax_year": metadata["tax_year"],
                "category": metadata["category"],
                "last_updated": metadata["last_updated"]
            })
        
        logger.info(f"  Generated {len(chunks)} chunks")
        return chunk_documents
    
    def _extract_section_title(self, chunk_text: str) -> str:
        """Extract section heading from chunk text (first line with heading markers)."""
        lines = chunk_text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and (line.isupper() or line.startswith('#') or len(line) < 100):
                return line.replace('#', '').strip()
        return "General"
    
    async def generate_embeddings(self, chunks: List[Dict]) -> List[Dict]:
        """
        Generate embeddings for all chunks using Azure OpenAI.
        
        Args:
            chunks: List of chunk dictionaries
        
        Returns:
            Chunks with chunk_embedding field added
        """
        logger.info(f"Generating embeddings for {len(chunks)} chunks")
        
        # Extract text for embedding generation
        texts = [chunk["chunk_text"] for chunk in chunks]
        
        # Batch embedding generation (process in groups of 100 for rate limiting)
        all_embeddings = []
        for i in range(0, len(texts), 100):
            batch_texts = texts[i:i+100]
            
            logger.info(f"  Processing batch {i//100 + 1}/{(len(texts)-1)//100 + 1}")
            
            response = await self.openai_client.embeddings.create(
                model=OPENAI_MODEL_NAME,
                input=batch_texts
            )
            
            batch_embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(batch_embeddings)
            
            # Rate limiting: 120K TPM quota, ~500 tokens per chunk = ~240 chunks/minute max
            # Wait 1 second between batches to avoid throttling
            await asyncio.sleep(1)
        
        # Attach embeddings to chunks
        for chunk, embedding in zip(chunks, all_embeddings):
            chunk["chunk_embedding"] = embedding
        
        logger.info(f"  Generated {len(all_embeddings)} embeddings")
        return chunks
    
    async def upload_to_search_index(self, chunks: List[Dict]):
        """
        Upload document chunks to AI Search index.
        
        Args:
            chunks: List of chunks with embeddings
        """
        logger.info(f"Uploading {len(chunks)} chunks to AI Search index: {SEARCH_INDEX_NAME}")
        
        # Upload in batches of 1000 (AI Search batch limit)
        batch_size = 1000
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            
            logger.info(f"  Uploading batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")
            
            # Prepare documents for upload
            documents = []
            for chunk in batch:
                documents.append({
                    "chunk_id": chunk["chunk_id"],
                    "document_id": chunk["document_id"],
                    "document_title": chunk["document_title"],
                    "document_url": chunk["document_url"],
                    "section_title": chunk["section_title"],
                    "chunk_text": chunk["chunk_text"],
                    "chunk_embedding": chunk["chunk_embedding"],
                    "tax_year": chunk["tax_year"],
                    "category": chunk["category"],
                    "last_updated": chunk["last_updated"]
                })
            
            # Upload batch
            result = self.search_client.upload_documents(documents=documents)
            
            # Check for indexing errors
            failed = [r for r in result if not r.succeeded]
            if failed:
                logger.error(f"  Failed to index {len(failed)} documents: {failed}")
            else:
                logger.info(f"  Successfully indexed {len(documents)} documents")
        
        logger.info("Upload complete")
    
    async def process_document(self, pdf_path: Path) -> List[Dict]:
        """
        Process single IRD document: extract text, chunk, generate embeddings.
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            List of chunks with embeddings
        """
        logger.info(f"Processing document: {pdf_path.name}")
        
        # Step 1: Extract text from PDF
        document_text = self.extract_text_from_pdf(pdf_path)
        
        # Step 2: Extract metadata
        metadata = self.extract_document_metadata(pdf_path)
        
        # Step 3: Chunk document
        chunks = self.chunk_document(document_text, metadata)
        
        # Step 4: Generate embeddings
        chunks = await self.generate_embeddings(chunks)
        
        logger.info(f"  Completed processing: {len(chunks)} chunks")
        return chunks
    
    async def process_all_documents(self, documents_path: str) -> List[Dict]:
        """
        Process all IRD documents in directory.
        
        Args:
            documents_path: Path to directory containing PDF files
        
        Returns:
            List of all chunks with embeddings
        """
        data_dir = Path(documents_path)
        pdf_files = list(data_dir.glob("*.pdf"))
        
        if not pdf_files:
            logger.error(f"No PDF files found in {documents_path}")
            return []
        
        logger.info(f"Found {len(pdf_files)} IRD documents to process")
        
        all_chunks = []
        
        # Process documents sequentially (parallel processing would exceed OpenAI rate limits)
        for pdf_path in pdf_files:
            try:
                chunks = await self.process_document(pdf_path)
                all_chunks.extend(chunks)
            except Exception as e:
                logger.error(f"Failed to process {pdf_path.name}: {str(e)}")
                continue
        
        logger.info(f"Total chunks generated: {len(all_chunks)}")
        return all_chunks
    
    async def run_ingestion_pipeline(self, documents_path: str):
        """
        Execute full ingestion pipeline.
        
        Args:
            documents_path: Path to IRD documents directory
        """
        logger.info("Starting IRD guidance ingestion pipeline")
        logger.info(f"  Documents path: {documents_path}")
        logger.info(f"  Chunk size: {CHUNK_SIZE} tokens")
        logger.info(f"  Chunk overlap: {CHUNK_OVERLAP} tokens")
        
        try:
            # Step 1: Process all documents (extract, chunk, embed)
            all_chunks = await self.process_all_documents(documents_path)
            
            if not all_chunks:
                logger.error("No chunks generated — ingestion aborted")
                return
            
            # Step 2: Upload to AI Search index
            await self.upload_to_search_index(all_chunks)
            
            # Step 3: Verify upload
            index_stats = self.search_client.get_document_count()
            logger.info(f"AI Search index document count: {index_stats}")
            
            logger.info("✅ IRD guidance ingestion complete")
            
        except Exception as e:
            logger.error(f"Ingestion pipeline failed: {str(e)}")
            raise


async def main():
    """Main entry point for ingestion script."""
    logger.info("=" * 80)
    logger.info("IRD Guidance Data Ingestion Pipeline")
    logger.info("=" * 80)
    
    processor = IRDDocumentProcessor()
    await processor.run_ingestion_pipeline(IRD_DOCUMENTS_PATH)


if __name__ == "__main__":
    asyncio.run(main())