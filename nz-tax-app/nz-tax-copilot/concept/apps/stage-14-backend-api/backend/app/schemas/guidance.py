"""
IRD guidance-related Pydantic models.
"""
from pydantic import BaseModel
from typing import List, Optional


class GuidanceQuery(BaseModel):
    """Request model for guidance query."""
    question: str
    workspace_id: Optional[str] = None


class GuidanceSource(BaseModel):
    """Source citation for guidance answer."""
    title: str
    url: str


class GuidanceResponse(BaseModel):
    """Response model for guidance query."""
    answer: str
    sources: List[GuidanceSource]