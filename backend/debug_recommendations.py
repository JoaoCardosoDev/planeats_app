#!/usr/bin/env python3
"""
Debug script to identify the exact issue with recommendations
"""
import os
import sys
from sqlmodel import Session, create_engine, select
from app.core.config import settings
from app.models.user_models import User
from app.models.pantry_models import PantryItem
from app.models.recipe_models import Recipe
from app.services.recommendation_service import get_recipe_recommendations
from app.schemas.recommendations import RecommendationFilters, RecommendationSort

def debug_user_data(user_id: int = 3):
    """Debug user data to see what's available"""
    print(f"🔍 Debugging data for user {user_id}")
    
    # Create database connection
    engine = create_engine(str(settings.DATABASE_URL))
    
    with Session(engine) as db:
        # Check if user exists
        user = db.exec(select(User).where(User.id == user_id)).first()
        if not user:
            print(f"❌ User {user_id} not found in database")
            return False
        
        print(f"✅ User found: {user.email}")
        
        # Check pantry items
        pantry_items = db.exec(select(PantryItem).where(PantryItem.user_id == user_id)).all()
        print(f"📦 Pantry items for user {user_id}: {len(pantry_items)}")
        
        if not pantry_items:
            print("❌ No pantry items found! User needs to add items to pantry first.")
            print("   Visit /meu-frigorifico to add pantry items")
            return False
        
        for item in pantry_items[:5]:  # Show first 5 items
            print(f"   - {item.item_name} ({item.quantity} {item.unit})")
        
        if len(pantry_items) > 5:
            print(f"   ... and {len(pantry_items) - 5} more items")
        
        # Check recipes
        recipes = db.exec(select(Recipe)).all()
        print(f"🍳 Total recipes in system: {len(recipes)}")
        
        if not recipes:
            print("❌ No recipes found! System needs recipes to recommend.")
            print("   Run: python create_test_recipes.py")
            return False
        
        for recipe in recipes[:3]:  # Show first 3 recipes
            print(f"   - {recipe.recipe_name}")
        
        if len(recipes) > 3:
            print(f"   ... and {len(recipes) - 3} more recipes")
        
        return True

def test_recommendation_service(user_id: int = 3):
    """Test the recommendation service directly"""
    print(f"\n🧪 Testing recommendation service for user {user_id}")
    
    engine = create_engine(str(settings.DATABASE_URL))
    
    with Session(engine) as db:
        try:
            # Test without preferences first
            print("Testing without preferences...")
            recommendations = get_recipe_recommendations(
                db=db,
                user_id=user_id,
                use_preferences=False
            )
            
            print(f"✅ Service returned {len(recommendations.recommendations)} recommendations")
            print(f"   Pantry items: {recommendations.total_pantry_items}")
            print(f"   Message: {recommendations.message}")
            
            if recommendations.message:
                print(f"   ⚠️  Message indicates: {recommendations.message}")
            
            return True
            
        except Exception as e:
            print(f"❌ Service error: {e}")
            import traceback
            traceback.print_exc()
            return False

def create_test_data():
    """Create minimal test data if missing"""
    print("\n🛠️  Creating test data...")
    
    engine = create_engine(str(settings.DATABASE_URL))
    
    with Session(engine) as db:
        # Check if user 3 has pantry items
        pantry_count = len(db.exec(select(PantryItem).where(PantryItem.user_id == 3)).all())
        
        if pantry_count == 0:
            print("Adding basic pantry items for user 3...")
            
            test_pantry_items = [
                PantryItem(
                    user_id=3,
                    item_name="chicken",
                    quantity=500,
                    unit="g",
                    category="meat"
                ),
                PantryItem(
                    user_id=3,
                    item_name="tomato",
                    quantity=3,
                    unit="pieces",
                    category="vegetables"
                ),
                PantryItem(
                    user_id=3,
                    item_name="onion",
                    quantity=2,
                    unit="pieces",
                    category="vegetables"
                ),
                PantryItem(
                    user_id=3,
                    item_name="rice",
                    quantity=1000,
                    unit="g",
                    category="grains"
                ),
                PantryItem(
                    user_id=3,
                    item_name="olive oil",
                    quantity=500,
                    unit="ml",
                    category="oils"
                )
            ]
            
            for item in test_pantry_items:
                db.add(item)
            
            db.commit()
            print(f"✅ Added {len(test_pantry_items)} pantry items")
        
        # Check if we have recipes
        recipe_count = len(db.exec(select(Recipe)).all())
        if recipe_count == 0:
            print("❌ No recipes in system. Run: python create_test_recipes.py")
            return False
        
        return True

if __name__ == "__main__":
    print("🚀 Recommendations Debug Tool")
    print("=" * 50)
    
    # Debug user data
    if not debug_user_data():
        print("\n🛠️  Attempting to create test data...")
        if create_test_data():
            print("✅ Test data created, re-checking...")
            debug_user_data()
        else:
            print("❌ Could not create test data")
            sys.exit(1)
    
    # Test the service
    if test_recommendation_service():
        print("\n🎉 Service appears to be working!")
        print("\nNext steps:")
        print("1. Restart the backend server")
        print("2. Visit http://localhost:3000/receitas-sugeridas")
        print("3. You should now see recommendations!")
    else:
        print("\n❌ Service still has issues")
        print("Check the error details above")
