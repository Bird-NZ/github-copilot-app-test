# Generate ingestion script configuration file
resource "local_file" "ingestion_config" {
  filename = "${path.module}/ingestion_config.json"
  
  content = jsonencode({
    search_service_name = var.search_service_name
    search_index_name   = var.search_index_name
    openai_endpoint     = var.openai_endpoint
    openai_deployment_embeddings = var.openai_deployment_embeddings
    managed_identity_client_id = var.managed_identity_client_id
    
    chunking_config = {
      chunk_size    = local.chunk_size
      chunk_overlap = local.chunk_overlap
      max_chunks_per_doc = local.max_chunks_per_doc
    }
    
    supported_extensions = local.supported_extensions
    document_categories  = local.document_categories
  })
}

# Generate Python ingestion script
resource "local_file" "ingestion_script" {
  filename = "${path.module}/${local.ingestion_script_name}"
  
  content = <<-PYTHON
#!/usr/bin/env python3
"""
IRD Guidance Document Ingestion Script

Ingests IRD guidance documents into Azure AI Search vector index.

Usage:
    python ingest_ird_guidance.py --documents-path ../../../data/ird-guidance

Prerequisites:
    - Azure CLI logged in with appropriate subscription
    - User-assigned managed identity has Search Index Data Contributor role
    - IRD guidance documents available in PDF format
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

# Azure SDK imports
from azure.identity import DefaultAzureCredential
from azure.search.documents import SearchClient
from openai import AzureOpenAI

# Document processing imports
import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter


class IRDGuidanceIngestion:
    """IRD guidance document ingestion pipeline."""
    
    def __init__(self, config_path: str = "ingestion_config.json"):
        """Initialize ingestion pipeline with configuration."""
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        # Initialize Azure clients
        self.credential = DefaultAzureCredential()
        
        # AI Search client
        self.search_client = SearchClient(
            endpoint=f"https://{self.config['search_service_name']}.search.windows.net",
            index_name=self.config['search_index_name'],
            credential=self.credential
        )
        
        # Azure OpenAI client
        self.openai_client = AzureOpenAI(
            azure_endpoint=self.config['openai_endpoint'],
            azure_ad_token_provider=self._get_token_provider(),
            api_version="2024-02-01"
        )
        
        # Text splitter for chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config['chunking_config']['chunk_size'],
            chunk_overlap=self.config['chunking_config']['chunk_overlap'],
            length_function=lambda text: len(text.split()),
            separators=["\n## ", "\n### ", "\n#### ", "\n\n", "\n", ". ", " ", ""]
        )
    
    def _get_token_provider(self):
        """Get Azure AD token provider for OpenAI authentication."""
        from azure.identity import get_bearer_token_provider
        return get_bearer_token_provider(
            self.credential,
            "https://cognitiveservices.azure.com/.default"
        )
    
    def extract_text_from_pdf(self, pdf_path: Path) -> str:
        """Extract text content from PDF file."""
        print(f"  Extracting text from {pdf_path.name}...")
        
        text_content = []
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text.strip():
                        text_content.append(text)
                
            full_text = "\n\n".join(text_content)
            print(f"  Extracted {len(full_text)} characters from {len(pdf_reader.pages)} pages")
            return full_text
            
        except Exception as e:
            print(f"  ERROR extracting text from {pdf_path.name}: {str(e)}")
            return ""
    
    def chunk_document(
        self,
        document_text: str,
        document_id: str,
        document_title: str,
        document_url: str,
        tax_year: str,
        category: str
    ) -> List[Dict[str, Any]]:
        """Chunk document into semantic segments."""
        print(f"  Chunking document: {document_title}...")
        
        # Split text into chunks
        chunks = self.text_splitter.split_text(document_text)
        
        # Limit chunks per document
        max_chunks = self.config['chunking_config']['max_chunks_per_doc']
        if len(chunks) > max_chunks:
            print(f"  WARNING: Document has {len(chunks)} chunks, limiting to {max_chunks}")
            chunks = chunks[:max_chunks]
        
        # Build chunk documents
        chunk_documents = []
        for idx, chunk_text in enumerate(chunks):
            chunk_documents.append({
                "chunk_id": f"{document_id}_chunk_{idx:03d}",
                "document_id": document_id,
                "document_title": document_title,
                "document_url": document_url,
                "section_title": self._extract_section_title(chunk_text),
                "chunk_text": chunk_text,
                "tax_year": tax_year,
                "category": category,
                "last_updated": datetime.utcnow().isoformat()
            })
        
        print(f"  Generated {len(chunk_documents)} chunks")
        return chunk_documents
    
    def _extract_section_title(self, chunk_text: str) -> str:
        """Extract section heading from chunk text."""
        lines = chunk_text.split('\n')
        for line in lines[:5]:
            if line.strip() and len(line.strip()) < 100:
                return line.strip()
        return "Unknown Section"
    
    async def generate_embeddings(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate embeddings for all chunks."""
        print(f"  Generating embeddings for {len(chunks)} chunks...")
        
        # Extract text for embedding generation
        texts = [chunk["chunk_text"] for chunk in chunks]
        
        # Batch embedding generation (up to 16 inputs per request for ada-002)
        batch_size = 16
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            try:
                response = self.openai_client.embeddings.create(
                    model=self.config['openai_deployment_embeddings'],
                    input=batch
                )
                
                embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(embeddings)
                
                print(f"    Generated embeddings for batch {i // batch_size + 1}/{(len(texts) + batch_size - 1) // batch_size}")
                
            except Exception as e:
                print(f"  ERROR generating embeddings for batch {i // batch_size + 1}: {str(e)}")
                # Use zero vectors as fallback
                all_embeddings.extend([[0.0] * 1536] * len(batch))
        
        # Attach embeddings to chunks
        for chunk, embedding in zip(chunks, all_embeddings):
            chunk["chunk_embedding"] = embedding
        
        print(f"  Embeddings generated successfully")
        return chunks
    
    async def upload_to_search_index(self, chunks: List[Dict[str, Any]]):
        """Upload chunks to AI Search index."""
        print(f"  Uploading {len(chunks)} chunks to AI Search index...")
        
        # Upload in batches of 1000 (AI Search batch limit)
        batch_size = 1000
        total_uploaded = 0
        
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            
            try:
                result = self.search_client.upload_documents(documents=batch)
                
                # Check for indexing errors
                failed = [r for r in result if not r.succeeded]
                if failed:
                    print(f"    WARNING: Failed to index {len(failed)} documents")
                    for failure in failed[:5]:
                        print(f"      {failure.key}: {failure.error_message}")
                
                successful = len(batch) - len(failed)
                total_uploaded += successful
                
                print(f"    Uploaded batch {i // batch_size + 1}/{(len(chunks) + batch_size - 1) // batch_size} ({successful}/{len(batch)} successful)")
                
            except Exception as e:
                print(f"  ERROR uploading batch {i // batch_size + 1}: {str(e)}")
        
        print(f"  Upload complete: {total_uploaded}/{len(chunks)} chunks indexed")
    
    async def ingest_document(self, pdf_path: Path) -> int:
        """Ingest a single IRD guidance document."""
        print(f"\nProcessing {pdf_path.name}...")
        
        # Extract metadata from filename
        document_id = pdf_path.stem.replace(' ', '-').replace('_', '-').lower()
        document_title = self._format_document_title(pdf_path.stem)
        document_url = f"https://www.ird.govt.nz/guidance/{document_id}"
        
        # Infer tax year and category from filename
        tax_year = self._extract_tax_year(pdf_path.stem)
        category = self._infer_category(pdf_path.stem)
        
        # Extract text from PDF
        document_text = self.extract_text_from_pdf(pdf_path)
        if not document_text:
            print(f"  Skipping {pdf_path.name} (no text extracted)")
            return 0
        
        # Chunk document
        chunks = self.chunk_document(
            document_text=document_text,
            document_id=document_id,
            document_title=document_title,
            document_url=document_url,
            tax_year=tax_year,
            category=category
        )
        
        if not chunks:
            print(f"  Skipping {pdf_path.name} (no chunks generated)")
            return 0
        
        # Generate embeddings
        chunks = await self.generate_embeddings(chunks)
        
        # Upload to AI Search
        await self.upload_to_search_index(chunks)
        
        return len(chunks)
    
    def _format_document_title(self, filename: str) -> str:
        """Format document title from filename."""
        # Remove extension and replace separators
        title = filename.replace('-', ' ').replace('_', ' ')
        # Title case
        return title.title()
    
    def _extract_tax_year(self, filename: str) -> str:
        """Extract tax year from filename."""
        import re
        match = re.search(r'20\d{2}', filename)
        if match:
            return match.group(0)
        return datetime.now().year
    
    def _infer_category(self, filename: str) -> str:
        """Infer document category from filename."""
        filename_lower = filename.lower()
        
        if 'crypto' in filename_lower:
            return 'crypto'
        elif 'self-employ' in filename_lower or 'business' in filename_lower:
            return 'self-employment'
        elif 'rental' in filename_lower:
            return 'rental-income'
        elif 'dividend' in filename_lower:
            return 'dividends'
        elif 'interest' in filename_lower:
            return 'interest'
        elif 'overseas' in filename_lower or 'foreign' in filename_lower:
            return 'overseas-income'
        elif 'rebate' in filename_lower or 'credit' in filename_lower:
            return 'rebates'
        else:
            return 'general'
    
    async def ingest_all_documents(self, documents_path: str) -> Dict[str, Any]:
        """Ingest all IRD guidance documents from directory."""
        documents_dir = Path(documents_path)
        
        if not documents_dir.exists():
            print(f"ERROR: Documents path does not exist: {documents_path}")
            sys.exit(1)
        
        # Find all PDF files
        pdf_files = list(documents_dir.glob("*.pdf"))
        
        if not pdf_files:
            print(f"WARNING: No PDF files found in {documents_path}")
            return {"total_documents": 0, "total_chunks": 0}
        
        print(f"\nFound {len(pdf_files)} IRD guidance documents")
        print(f"Target index: {self.config['search_index_name']}")
        print(f"Search service: {self.config['search_service_name']}")
        print()
        
        # Ingest each document
        total_chunks = 0
        successful_docs = 0
        
        for pdf_path in sorted(pdf_files):
            try:
                chunks = await self.ingest_document(pdf_path)
                total_chunks += chunks
                successful_docs += 1
            except Exception as e:
                print(f"ERROR processing {pdf_path.name}: {str(e)}")
        
        print(f"\n{'='*60}")
        print(f"Ingestion Summary:")
        print(f"  Documents processed: {successful_docs}/{len(pdf_files)}")
        print(f"  Total chunks indexed: {total_chunks}")
        print(f"  Average chunks per document: {total_chunks // successful_docs if successful_docs > 0 else 0}")
        print(f"{'='*60}\n")
        
        return {
            "total_documents": len(pdf_files),
            "successful_documents": successful_docs,
            "total_chunks": total_chunks,
            "timestamp": datetime.utcnow().isoformat()
        }


async def main():
    """Main ingestion pipeline."""
    parser = argparse.ArgumentParser(description="Ingest IRD guidance documents into AI Search")
    parser.add_argument(
        "--documents-path",
        type=str,
        default="../../../data/ird-guidance",
        help="Path to IRD guidance PDF documents"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="ingestion_config.json",
        help="Path to ingestion configuration file"
    )
    
    args = parser.parse_args()
    
    # Initialize ingestion pipeline
    pipeline = IRDGuidanceIngestion(config_path=args.config)
    
    # Run ingestion
    result = await pipeline.ingest_all_documents(args.documents_path)
    
    # Write result summary
    with open("ingestion_result.json", 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"Ingestion result saved to ingestion_result.json")
    
    # Exit with appropriate code
    if result['successful_documents'] == 0:
        print("ERROR: No documents successfully ingested")
        sys.exit(1)
    elif result['successful_documents'] < result['total_documents']:
        print("WARNING: Some documents failed to ingest")
        sys.exit(2)
    else:
        print("SUCCESS: All documents ingested successfully")
        sys.exit(0)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
PYTHON
}

# Generate Python requirements file
resource "local_file" "requirements" {
  filename = "${path.module}/${local.requirements_file}"
  
  content = <<-REQUIREMENTS
# Azure SDK dependencies
azure-identity==1.19.0
azure-search-documents==11.6.0
openai==1.58.1

# Document processing
PyPDF2==3.0.1
langchain==0.3.12
langchain-text-splitters==0.3.2

# Utilities
python-dotenv==1.0.1
REQUIREMENTS
}

# Generate README for ingestion stage
resource "local_file" "readme" {
  filename = "${path.module}/README.md"
  
  content = <<-README
# Stage 16: IRD Guidance Data Ingestion

This stage provides a Python script to ingest IRD guidance documents into the Azure AI Search index.

## Prerequisites

1. **Azure CLI Authentication**:
   ```bash
   az login
   az account set --subscription <subscription_id>
   ```

2. **Python Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **IRD Guidance Documents**:
   - Place PDF documents in `../../../data/ird-guidance/` directory
   - Supported document types: PDF only
   - Recommended naming: `IR3-Guide-2024.pdf`, `Crypto-Tax-Guidance-2024.pdf`

4. **Managed Identity Permissions**:
   - The user-assigned managed identity from Stage 1 must have:
     - `Search Index Data Contributor` role on AI Search service
     - `Cognitive Services OpenAI User` role on Azure OpenAI service
   - These roles were assigned in Stages 8 and 9

## Running the Ingestion

### Full Ingestion (All Documents)

```bash
# Activate Python virtual environment
source venv/bin/activate

# Run ingestion script
python ingest_ird_guidance.py --documents-path ../../../data/ird-guidance

# Check ingestion result
cat ingestion_result.json