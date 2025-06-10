#!/usr/bin/env python3
"""
Simple test to verify MealDB service is working
"""
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

async def test_mealdb_service():
    """Test MealDB service directly"""
    print("🔍 Testing MealDB Service...")
    
    try:
        from app.services.mealdb_service import mealdb_service
        
        # Test 1: Get random meal
        print("\n🎲 Test 1: Getting random meal...")
        meal = await mealdb_service.get_random_meal()
        if meal:
            print(f"✅ Got random meal: {meal.name} (ID: {meal.id})")
        else:
            print("❌ No random meal returned")
            return False
        
        # Test 2: Get categories
        print("\n📂 Test 2: Getting categories...")
        categories = await mealdb_service.get_categories()
        print(f"✅ Got {len(categories)} categories")
        
        # Test 3: Get areas
        print("\n🌍 Test 3: Getting areas...")
        areas = await mealdb_service.get_areas()
        print(f"✅ Got {len(areas)} areas")
        
        # Test 4: Search by name
        print("\n🔍 Test 4: Searching for pasta...")
        pasta_meals = await mealdb_service.search_meals_by_name("pasta")
        print(f"✅ Found {len(pasta_meals)} pasta recipes")
        
        # Close the client
        await mealdb_service.close()
        print("\n🏁 All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_mealdb_service())
    sys.exit(0 if success else 1)
