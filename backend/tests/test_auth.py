import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.security import verify_password, get_password_hash
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate

def test_login_success(client: TestClient, test_user):
    """Test successful login"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"

def test_login_wrong_password(client: TestClient, test_user):
    """Test login with wrong password"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_nonexistent_user(client: TestClient):
    """Test login with non-existent user"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_verify_token(client: TestClient, test_user_token):
    """Test token verification"""
    response = client.post(
        "/api/v1/auth/verify-token",
        headers={"Authorization": f"Bearer {test_user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"

def test_verify_invalid_token(client: TestClient):
    """Test verification with invalid token"""
    response = client.post(
        "/api/v1/auth/verify-token",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"

def test_register_success(client: TestClient):
    """Test successful user registration"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "newpassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["username"] == "newuser"
    assert "hashed_password" not in data

def test_register_duplicate_email(client: TestClient, test_user):
    """Test registration with duplicate email"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "differentuser",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_register_duplicate_username(client: TestClient, test_user):
    """Test registration with duplicate username"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "different@example.com",
            "username": "testuser",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already taken"

def test_register_invalid_email(client: TestClient):
    """Test registration with invalid email format"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "invalid-email",
            "username": "newuser",
            "password": "testpassword123"
        }
    )
    assert response.status_code == 422

def test_register_short_password(client: TestClient):
    """Test registration with too short password"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "short"
        }
    )
    assert response.status_code == 422

def test_password_hashing():
    """Test password hashing and verification functions"""
    password = "testpassword123"
    hashed = get_password_hash(password)
    
    # Test that hashes are different for same password
    hashed2 = get_password_hash(password)
    assert hashed != hashed2
    
    # Test verification
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False 