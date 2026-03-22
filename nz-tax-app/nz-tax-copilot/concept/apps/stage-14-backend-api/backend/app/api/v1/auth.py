"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Returns:
        User ID from JWT token
    """
    return {
        "userId": user_id,
        "authenticated": True
    }