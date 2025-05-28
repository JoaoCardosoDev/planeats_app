from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.api.v1.deps import get_db, get_current_active_user
from app.core.config import settings
from app.core.security import create_access_token
from app.crud.crud_user import user as crud_user
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserLogin, UserLoginResponse
from app.schemas.token import Token

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register a new user
    
    - **email**: valid email address
    - **password**: minimum 8 characters
    - **username**: unique username (3-50 characters)
    
    Returns the created user data (excluding password)
    """
    # Check if email already exists
    if crud_user.is_email_taken(db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if crud_user.is_username_taken(db, username=user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = crud_user.create(db, obj_in=user_in)
    return user


@router.post("/login", response_model=UserLoginResponse)
def login_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserLogin,
) -> Any:
    """
    Login for NextAuth.js - returns user object with access token
    """
    user = crud_user.authenticate(
        db, email=user_in.email, password=user_in.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    elif not crud_user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}, expires_delta=access_token_expires
    )
    
    return UserLoginResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/login/oauth2", response_model=Token)
def login_oauth2(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login for Swagger UI
    """
    user = crud_user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    elif not crud_user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/verify-token", response_model=UserRead)
def verify_token(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Verify JWT token and return user information
    Used by NextAuth.js for token validation
    """
    return current_user


@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user information
    """
    return current_user


@router.post("/test-token", response_model=UserRead)
def test_token(current_user: User = Depends(get_current_active_user)) -> Any:
    """
    Test access token
    """
    return current_user
