"""
Document-related Pydantic models.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentUploadUrlRequest(BaseModel):
    """Request model for upload URL generation."""
    file_name: str
    file_type: str
    file_size: int
    category: Optional[str] = None


class DocumentUploadUrlResponse(BaseModel):
    """Response model for upload URL."""
    document_id: str
    upload_url: str
    expires_at: datetime


class DocumentResponse(BaseModel):
    """Response model for document metadata."""
    document_id: str
    workspace_id: str
    file_name: str
    file_type: str
    file_size: int
    category: Optional[str]
    uploaded_at: Optional[datetime]