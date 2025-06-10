#!/usr/bin/env python3
"""
Quick test script to verify The Meal DB API integration is working.
Run this script to test the connection and basic functionality.

Usage: python test_mealdb_connection.py
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.mealdb_service import MealDBService

async def test_mealdb_integration():
    """Test The Meal DB API integration"""
    print("🍽️  Testing The Meal DB API Integration for PlanEats")
    print("=" * 60)
    
    service = MealDBService()
    
    try:
        # Test 1: Get a random meal
        print("\n📝 Test 1: Getting a random meal...")
        random_meal = await service.get_random_meal()
        
        if random_meal:
            print(f"✅ SUCCESS: Got random meal '{random_meal.name}'")
            print(f"   Category: {random_meal.category}")
            print(f"   Cuisine: {random_meal.area}")
            print(f"   Ingredients: {len(random_meal.ingredients)}")
            print(f"   Has video: {'Yes' if random_meal.youtube_url else 'No'}")
        else:
            print("❌ FAILED: No random meal returned")
            return False
        
        # Test 2: Search for a specific recipe
        print("\n🔍 Test 2: Searching for 'pasta' recipes...")
        pasta_meals = await service.search_meals_by_name("pasta")
        
        if pasta_meals:
            print(f"✅ SUCCESS: Found {len(pasta_meals)} pasta recipes")
            for i, meal in enumerate(pasta_meals[:3]):  # Show first 3
                print(f"   {i+1}. {meal.name} ({meal.category})")
        else:
            print("⚠️  WARNING: No pasta recipes found")
        
        # Test 3: Get categories
        print("\n📂 Test 3: Getting recipe categories...")
        categories = await service.get_categories()
        
        if categories:
            print(f"✅ SUCCESS: Found {len(categories)} categories")
            category_names = [cat.name for cat in categories[:5]]
            print(f"   First 5: {', '.join(category_names)}")
        else:
            print("❌ FAILED: No categories returned")
            return False
        
        # Test 4: Get areas/cuisines
        print("\n🌍 Test 4: Getting cuisine areas...")
        areas = await service.get_areas()
        
        if areas:
            print(f"✅ SUCCESS: Found {len(areas)} cuisine areas")
            area_names = [area.name for area in areas[:5]]
            print(f"   First 5: {', '.join(area_names)}")
        else:
            print("❌ FAILED: No areas returned")
            return False
        
        # Test 5: Filter by category
        print("\n🐔 Test 5: Filtering by 'Chicken' category...")
        chicken_meals = await service.filter_by_category("Chicken")
        
        if chicken_meals:
            print(f"✅ SUCCESS: Found {len(chicken_meals)} chicken recipes")
            if chicken_meals:
                print(f"   Example: {chicken_meals[0].name}")
        else:
            print("⚠️  WARNING: No chicken recipes found")
        
        # Test 6: Get specific meal by ID
        print("\n🔗 Test 6: Getting specific meal by ID...")
        if random_meal:
            specific_meal = await service.get_meal_by_id(random_meal.id)
            
            if specific_meal and specific_meal.id == random_meal.id:
                print(f"✅ SUCCESS: Retrieved meal '{specific_meal.name}' by ID")
                print(f"   Instructions length: {len(specific_meal.instructions)} characters")
                print(f"   Ingredients count: {len(specific_meal.ingredients)}")
            else:
                print("❌ FAILED: Could not retrieve meal by ID")
                return False
        
        # Test 7: Image URL generation
        print("\n🖼️  Test 7: Testing image URL generation...")
        ingredient_img = service.get_ingredient_image_url("chicken", "medium")
        print(f"✅ SUCCESS: Ingredient image URL: {ingredient_img}")
        
        if random_meal and random_meal.image_url:
            thumbnail_img = service.get_meal_thumbnail_url(random_meal.image_url, "small")
            print(f"✅ SUCCESS: Meal thumbnail URL: {thumbnail_img}")
        
        print("\n🎉 All tests completed successfully!")
        print("\n📊 Integration Summary:")
        print(f"   - API Connection: ✅ Working")
        print(f"   - Recipe Search: ✅ Working")
        print(f"   - Categories: ✅ Working ({len(categories)} found)")
        print(f"   - Cuisines: ✅ Working ({len(areas)} found)")
        print(f"   - Recipe Details: ✅ Working")
        print(f"   - Image URLs: ✅ Working")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        return False
    
    finally:
        await service.close()

async def test_import_service():
    """Test the import service functionality"""
    print("\n🔄 Testing MealDB Import Service...")
    print("-" * 40)
    
    from app.services.mealdb_import_service import MealDBImportService
    
    import_service = MealDBImportService()
    
    try:
        # Get a random meal to test conversion
        random_meal = await import_service.mealdb_service.get_random_meal()
        
        if random_meal:
            print(f"📋 Testing conversion for: {random_meal.name}")
            
            # Test calorie estimation
            calories = import_service._estimate_calories(random_meal)
            print(f"   Estimated calories: {calories}")
            
            # Test prep time estimation
            prep_time = import_service._estimate_prep_time(random_meal)
            print(f"   Estimated prep time: {prep_time} minutes")
            
            # Test conversion to recipe format
            recipe_create = import_service._convert_mealdb_to_recipe_create(random_meal)
            print(f"   ✅ Successfully converted to PlanEats format")
            print(f"   Recipe name: {recipe_create.recipe_name}")
            print(f"   Ingredients: {len(recipe_create.ingredients)}")
            print(f"   Has enhanced instructions: {'Video tutorial' in recipe_create.instructions}")
            
            return True
        else:
            print("❌ Could not get random meal for testing")
            return False
            
    except Exception as e:
        print(f"❌ Import service error: {str(e)}")
        return False
    
    finally:
        await import_service.close()

def print_integration_info():
    """Print information about the integration"""
    print("\n📋 The Meal DB Integration Information")
    print("=" * 50)
    print("🌐 API Base URL: https://www.themealdb.com/api/json/v1/1")
    print("📚 Documentation: https://www.themealdb.com/api.php")
    print("💰 Cost: Free (no API key required)")
    print("🎯 Features:")
    print("   - 🔍 Recipe search and filtering")
    print("   - 📂 Categories and cuisines")
    print("   - 🖼️  High-quality recipe images")
    print("   - 🎥 Video tutorials (when available)")
    print("   - 🌍 International recipes")
    print("   - 📝 Detailed instructions")
    print("   - 🧄 Ingredient lists with measurements")
    print("\n🔗 PlanEats Integration Endpoints:")
    print("   - GET /api/v1/mealdb/search")
    print("   - GET /api/v1/mealdb/meal/{id}")
    print("   - GET /api/v1/mealdb/random")
    print("   - GET /api/v1/mealdb/categories")
    print("   - POST /api/v1/mealdb/import/{id}")
    print("   - GET /api/v1/mealdb/suggestions-by-pantry")

async def main():
    """Main test function"""
    print_integration_info()
    
    # Test basic API connectivity
    success = await test_mealdb_integration()
    
    if success:
        # Test import service
        import_success = await test_import_service()
        
        if import_success:
            print("\n🎉 OVERALL RESULT: All tests passed!")
            print("The Meal DB integration is ready for use in PlanEats.")
            print("\n🚀 Next steps:")
            print("   1. Start the backend server: make run")
            print("   2. Test endpoints at: http://localhost:8000/docs")
            print("   3. Try the test endpoint: GET /api/v1/mealdb/test-connection")
            return 0
        else:
            print("\n⚠️  OVERALL RESULT: Import service tests failed")
            return 1
    else:
        print("\n❌ OVERALL RESULT: Basic API tests failed")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
