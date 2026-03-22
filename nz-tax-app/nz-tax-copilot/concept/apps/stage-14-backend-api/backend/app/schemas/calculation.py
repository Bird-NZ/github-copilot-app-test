"""
Calculation-related Pydantic models.
"""
from pydantic import BaseModel
from typing import List
from decimal import Decimal


class IR3Line(BaseModel):
    """Single line in IR3 breakdown."""
    box_code: str
    description: str
    amount: Decimal


class CalculationResult(BaseModel):
    """Result model for IR3 calculation."""
    workspace_id: str
    tax_year: int
    lines: List[IR3Line]
    total_income: Decimal
    tax_payable: Decimal