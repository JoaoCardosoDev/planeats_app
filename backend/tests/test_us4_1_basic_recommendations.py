#!/usr/bin/env python3
"""
Test script for US4.1 - Basic Recipe Recommendations
"""
import sys
from pathlib import Path
import asyncio

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.user_models import User
from app.models.pantry_models import PantryItem
from app.models.recipe_models import Recipe
from app.services.recommendation_service import get_recipe_recommendations
from app.schemas.recommendations import RecommendationFilters, RecommendationSort
from datetime import date, timedelta

def test_basic_recommendations():
    """Test basic recommendation functionality"""
    print("🧪 Testing US4.1 - Basic Recipe Recommendations")
    
    with Session(engine) as session:
        # Get or create a test user
        test_user = session.exec(select(User).where(User.username == "testuser")).first()
        if not test_user:
            print("❌ No test user found. Please create a test user first.")
            return
        
        print(f"👤 Using test user: {test_user.username} (ID: {test_user.id})")
        
        # Check pantry items
        pantry_items = session.exec(
            select(PantryItem).where(PantryItem.user_id == test_user.id)
        ).all()
        
        print(f"🥫 User has {len(pantry_items)} pantry items:")
        for item in pantry_items[:5]:  # Show first 5
            print(f"   - {item.item_name} ({item.quantity} {item.unit})")
        if len(pantry_items) > 5:
            print(f"   ... and {len(pantry_items) - 5} more")
        
        # Check available recipes
        recipes = session.exec(select(Recipe)).all()
        print(f"🍽️  System has {len(recipes)} recipes available")
        
        if len(pantry_items) == 0:
            print("⚠️  No pantry items found. Adding some test items...")
            # Add some basic test pantry items
            test_items = [
                {"item_name": "arroz", "quantity": 1, "unit": "kg"},
                {"item_name": "frango", "quantity": 500, "unit": "gramas"},
                {"item_name": "cebola", "quantity": 2, "unit": "unidades"},
                {"item_name": "alho", "quantity": 1, "unit": "cabeça"},
                {"item_name": "azeite", "quantity": 500, "unit": "ml"}
            ]
            
            for item_data in test_items:
                pantry_item = PantryItem(
                    user_id=test_user.id,
                    **item_data,
                    expiration_date=date.today() + timedelta(days=30)
                )
                session.add(pantry_item)
            
            session.commit()
            print("✅ Added test pantry items")
        
        # Test basic recommendations (without filters)
        print("\n🔍 Testing basic recommendations (no filters)...")
        try:
            recommendations = get_recipe_recommendations(
                db=session,
                user_id=test_user.id,
                use_preferences=False  # Disable preferences for basic test
            )
            
            print(f"✅ Got recommendations response:")
            print(f"   📊 Total pantry items: {recommendations.total_pantry_items}")
            print(f"   🔢 Recipes analyzed: {recommendations.metadata.total_recipes_analyzed}")
            print(f"   📝 Recommendations: {len(recommendations.recommendations)}")
            
            if recommendations.message:
                print(f"   💬 Message: {recommendations.message}")
            
            # Show top 3 recommendations
            for i, rec in enumerate(recommendations.recommendations[:3], 1):
                print(f"\n   {i}. {rec.recipe_name}")
                print(f"      Match Score: {rec.match_score:.1%}")
                print(f"      Matching ingredients: {len(rec.matching_ingredients)}")
                print(f"      Missing ingredients: {len(rec.missing_ingredients)}")
                if rec.matching_ingredients:
                    print(f"      Uses: {', '.join([ing.pantry_item_name for ing in rec.matching_ingredients[:3]])}")
                if rec.expiring_ingredients_used:
                    print(f"      ⚠️  Uses expiring: {', '.join([ing.pantry_item_name for ing in rec.expiring_ingredients_used])}")
            
        except Exception as e:
            print(f"❌ Error getting recommendations: {e}")
            import traceback
            traceback.print_exc()
            return
        
        # Test with filters
        print("\n🔍 Testing recommendations with filters...")
        try:
            filters = RecommendationFilters(
                max_preparation_time=60,  # 1 hour max
                max_calories=400
            )
            
            filtered_recommendations = get_recipe_recommendations(
                db=session,
                user_id=test_user.id,
                filters=filters,
                use_preferences=False
            )
            
            print(f"✅ Filtered recommendations:")
            print(f"   📝 Count: {len(filtered_recommendations.recommendations)}")
            print(f"   🎯 Before filters: {filtered_recommendations.metadata.total_before_filters}")
            print(f"   🎯 After filters: {filtered_recommendations.metadata.total_after_filters}")
            
        except Exception as e:
            print(f"❌ Error with filtered recommendations: {e}")
        
        # Test sorting
        print("\n🔍 Testing recommendation sorting...")
        try:
            sort = RecommendationSort(
                sort_by="preparation_time",
                sort_order="asc"
            )
            
            sorted_recommendations = get_recipe_recommendations(
                db=session,
                user_id=test_user.id,
                sort=sort,
                use_preferences=False
            )
            
            print(f"✅ Sorted recommendations (by prep time ascending):")
            for i, rec in enumerate(sorted_recommendations.recommendations[:3], 1):
                prep_time = rec.preparation_time_minutes or "N/A"
                print(f"   {i}. {rec.recipe_name} - {prep_time} min")
            
        except Exception as e:
            print(f"❌ Error with sorted recommendations: {e}")
    
    print("\n🎉 US4.1 Basic Recommendations test completed!")

if __name__ == "__main__":
    test_basic_recommendations()
