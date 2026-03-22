"""
Workspace-related Pydantic models.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class WorkspaceCreate(BaseModel):
    """Request model for creating workspace."""
    tax_year: int


class WorkspaceUpdate(BaseModel):
    """Request model for updating workspace."""
    status: Optional[str] = None


class WorkspaceResponse(BaseModel):
    """Response model for workspace."""
    workspace_id: str
    user_id: str
    tax_year: int
    status: str
    created_at: datetime