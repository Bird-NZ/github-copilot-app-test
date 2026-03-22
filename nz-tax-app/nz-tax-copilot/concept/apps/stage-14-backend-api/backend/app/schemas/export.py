"""
Export-related Pydantic models.
"""
from pydantic import BaseModel


class ExportRequest(BaseModel):
    """Request model for export generation."""
    format: str = "csv"  # Only CSV supported in prototype


class ExportResult(BaseModel):
    """Result model for export."""
    format: str
    content: str
    filename: str