#!/usr/bin/env python3
"""
Script to create a test user for authentication testing
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.user_models import User
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate

def create_test_user():
    """Create test user for development"""
    
    print("🔍 Creating test user...")
    
    user_data = UserCreate(
        email="test@planeats.com",
        password="password123",
        username="testuser"
    )
    
    try:
        with Session(engine) as session:
            # Check if user already exists
            existing = crud_user.get_by_email(session, email=user_data.email)
            if existing:
                print(f"✅ User '{user_data.email}' already exists with ID {existing.id}")
                return existing.id
            
            # Create the user
            user = crud_user.create(session, obj_in=user_data)
            print(f"✨ Created user: {user.email} with ID {user.id}")
            return user.id
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        raise

if __name__ == "__main__":
    user_id = create_test_user()
    print(f"🎉 Test user ready! User ID: {user_id}")
