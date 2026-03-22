"""
Income-related Pydantic models.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class IncomeCreate(BaseModel):
    """Request model for creating income entry."""
    income_type: str
    amount: Decimal
    description: str


class IncomeUpdate(BaseModel):
    """Request model for updating income entry."""
    income_type: Optional[str] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None


class IncomeResponse(BaseModel):
    """Response model for income entry."""
    income_id: str
    workspace_id: str
    income_type: str
    amount: Decimal
    description: str
    ir3_box_code: str
    created_at: datetime