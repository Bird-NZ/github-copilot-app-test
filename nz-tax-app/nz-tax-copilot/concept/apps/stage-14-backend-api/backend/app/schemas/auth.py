"""
Authentication-related Pydantic models.
"""
from pydantic import BaseModel, EmailStr


class UserProfile(BaseModel):
    """User profile information from JWT token."""
    user_id: str
    email: str