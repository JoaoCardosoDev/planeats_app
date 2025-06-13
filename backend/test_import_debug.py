#!/usr/bin/env python3

import asyncio
import httpx
import sys
import os

# Add the backend directory to Python path
sys.path.append('/workspaces/planeats-app/backend')

from app.services.mealdb_service import mealdb_service
from app.services.mealdb_import_service import mealdb_import_service
from app.db.session import SessionLocal
from app.models.user_models import User

async def test_import_functionality():
    """Test the MealDB import functionality directly"""
    
    print("🔍 Testing MealDB Import Functionality...")
    
    # Test 1: Check MealDB connection
    print("\n📡 Test 1: Testing MealDB API connection...")
    try:
        random_meal = await mealdb_service.get_random_meal()
        print(f"✅ MealDB Connection OK - Got meal: {random_meal.name} (ID: {random_meal.id})")
        test_meal_id = random_meal.id
    except Exception as e:
        print(f"❌ MealDB Connection Failed: {e}")
        return
    
    # Test 2: Test import service with database
    print(f"\n📥 Test 2: Testing import service for meal ID {test_meal_id}...")
    try:
        # Create a test user
        db = SessionLocal()
        
        # Check if test user exists, create if not
        test_user = db.query(User).filter(User.email == "admin@planeats.com").first()
        if not test_user:
            from app.core.security import get_password_hash
            test_user = User(
                email="admin@planeats.com",
                username="admin",
                full_name="Admin PlanEats",
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print("✅ Created test user")
        
        # Test the import
        result = await mealdb_import_service.import_meal_by_id(
            db=db,
            meal_id=test_meal_id,
            user=test_user
        )
        
        if result["success"]:
            print(f"✅ Import successful: {result['recipe_name']}")
            print(f"   Recipe ID: {result.get('recipe_id')}")
            print(f"   Estimated calories: {result.get('estimated_calories')}")
            print(f"   Estimated prep time: {result.get('estimated_prep_time')}")
        else:
            print(f"❌ Import failed: {result.get('error')}")
        
        db.close()
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Test API endpoints
    print("\n🌐 Test 3: Testing HTTP API endpoints...")
    async with httpx.AsyncClient() as client:
        try:
            # Test connection endpoint
            response = await client.get("http://localhost:8000/api/v1/mealdb/test-connection")
            if response.status_code == 200:
                result = response.json()
                print("✅ MealDB API endpoint working:", result["message"])
            else:
                print(f"❌ MealDB API endpoint failed: {response.status_code}")
            
            # Test authentication endpoint
            auth_response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json={
                    "email": "admin@planeats.com",
                    "password": "admin123"
                }
            )
            
            if auth_response.status_code == 200:
                auth_data = auth_response.json()
                print("✅ Authentication successful")
                
                # Test import with proper auth
                import_response = await client.post(
                    f"http://localhost:8000/api/v1/mealdb/import/{test_meal_id}",
                    headers={
                        "Authorization": f"Bearer {auth_data['access_token']}"
                    }
                )
                
                if import_response.status_code == 200:
                    import_data = import_response.json()
                    print("✅ Import via API successful:", import_data["message"])
                else:
                    error_data = import_response.json()
                    print(f"❌ Import via API failed ({import_response.status_code}): {error_data}")
            else:
                auth_error = auth_response.json()
                print(f"❌ Authentication failed: {auth_error}")
                
        except Exception as e:
            print(f"❌ API test failed: {e}")
    
    print("\n🏁 Test completed!")

if __name__ == "__main__":
    # Set environment variables if needed
    os.environ.setdefault("DATABASE_URL", "sqlite:///./planeats.db")
    
    asyncio.run(test_import_functionality())
