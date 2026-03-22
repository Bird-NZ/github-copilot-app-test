"""
Crypto transaction-related Pydantic models.
"""
from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Dict
from decimal import Decimal


class CryptoTransactionCreate(BaseModel):
    """Request model for creating crypto transaction."""
    type: str  # 'buy' or 'sell'
    currency: str  # 'BTC', 'ETH', etc.
    amount: Decimal
    price_nzd: Decimal
    date: date


class CryptoTransactionResponse(BaseModel):
    """Response model for crypto transaction."""
    transaction_id: str
    workspace_id: str
    type: str
    currency: str
    amount: Decimal
    price_nzd: Decimal
    date: date
    created_at: datetime


class CryptoCalculationResult(BaseModel):
    """Result model for capital gains calculation."""
    total_capital_gain: Decimal
    gains_by_currency: Dict[str, Decimal]
    transaction_count: int