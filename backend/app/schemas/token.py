from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for JWT token payload data"""
    email: Optional[str] = None
    user_id: Optional[int] = None


class RefreshToken(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str