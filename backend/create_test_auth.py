#!/usr/bin/env python3
"""
Script to create test JWT token for authentication testing
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session
from app.db.session import engine
from app.crud.crud_user import user as crud_user
from app.schemas.user import UserCreate
from app.core.security import create_access_token
from datetime import timedelta

def create_test_jwt():
    """Create test JWT token for user ID 2"""
    
    print("🔍 Creating test JWT token...")
    
    try:
        with Session(engine) as session:
            # Get user with ID 2
            user = crud_user.get(session, id=2)
            if not user:
                print("❌ User with ID 2 not found")
                return None
            
            print(f"✅ Found user: {user.email} (ID: {user.id})")
            
            # Create JWT token
            access_token = create_access_token(
                data={"sub": user.email, "user_id": user.id}, 
                expires_delta=timedelta(hours=24)  # 24 hour token for testing
            )
            
            print(f"🎟️  JWT Token: {access_token}")
            print(f"🧪 Test command:")
            print(f'curl -H "Authorization: Bearer {access_token}" http://localhost:8000/api/v1/auth/me')
            
            return access_token
        
    except Exception as e:
        print(f"❌ Error creating JWT token: {e}")
        raise

def create_admin_user():
    """Create admin user for NextAuth fallback"""
    
    print("🔍 Creating admin user...")
    
    admin_data = UserCreate(
        email="admin@planeats.com",
        password="admin123",
        username="admin2"  # Different username to avoid conflicts
    )
    
    try:
        with Session(engine) as session:
            # Check if user already exists
            existing = crud_user.get_by_email(session, email=admin_data.email)
            if existing:
                print(f"✅ Admin user '{admin_data.email}' already exists with ID {existing.id}")
                return existing.id
            
            # Create the user
            user = crud_user.create(session, obj_in=admin_data)
            print(f"✨ Created admin user: {user.email} with ID {user.id}")
            return user.id
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        # Return None if creation fails, we can still generate token for user 2
        return None

if __name__ == "__main__":
    admin_id = create_admin_user()
    token = create_test_jwt()
    print(f"🎉 Authentication setup complete!")
    print(f"   👤 Test user ID: 2")
    if admin_id:
        print(f"   👤 Admin user ID: {admin_id}")
    print(f"   🎟️  Use the JWT token above for API testing")
