"""
Questionnaire-related Pydantic models.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any


class QuestionnaireSubmit(BaseModel):
    """Request model for questionnaire submission."""
    responses: Dict[str, Any]


class QuestionnaireResponse(BaseModel):
    """Response model for questionnaire."""
    workspace_id: str
    responses: Dict[str, Any]
    completed_at: datetime