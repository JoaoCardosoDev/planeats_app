from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration request"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, max_length=100, description="User's password")
    username: str = Field(..., min_length=3, max_length=50, description="User's username")


class UserRead(BaseModel):
    """Schema for user response"""
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for user update request"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    is_active: Optional[bool] = None


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserLoginResponse(BaseModel):
    """Schema for user login response - compatible with NextAuth.js"""
    id: int
    email: str
    username: str
    access_token: str
    token_type: str = "bearer"

    class Config:
        from_attributes = True