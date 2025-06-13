"""
Unit tests for Recipe Filtering functionality (US3.2)
Tests the GET /recipes endpoint with various filtering parameters.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user_models import User
from app.models.recipe_models import Recipe, RecipeCreate, RecipeIngredientCreate
from app.crud.crud_recipe import recipe as crud_recipe

class TestRecipeFiltering:
    """Test Recipe Filtering functionality (US3.2)"""
    
    def test_ac_3_2_1_user_created_only_filter(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        AC3.2.1: Pedido GET /recipes?user_created_only=true
        """
        # Create user recipes
        user_recipe_1 = RecipeCreate(
            recipe_name="User Recipe 1",
            instructions="User instructions 1",
            estimated_calories=300,
            preparation_time_minutes=20,
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Ingredient 1", required_quantity=1.0, required_unit="cup")
            ]
        )
        user_recipe_2 = RecipeCreate(
            recipe_name="User Recipe 2", 
            instructions="User instructions 2",
            estimated_calories=400,
            preparation_time_minutes=25,
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Ingredient 2", required_quantity=2.0, required_unit="tbsp")
            ]
        )
        
        # Create system recipe (created_by_user_id = None)
        system_recipe = RecipeCreate(
            recipe_name="System Recipe",
            instructions="System instructions",
            estimated_calories=500,
            preparation_time_minutes=30,
            ingredients=[
                RecipeIngredientCreate(ingredient_name="System Ingredient", required_quantity=1.0, required_unit="unit")
            ]
        )
        
        # Save recipes
        crud_recipe.create_with_user(session_fixture, obj_in=user_recipe_1, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=user_recipe_2, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=system_recipe, user_id=None)  # System recipe
        
        # Test user_created_only=true (should only return user's recipes)
        response = client.get(
            "/api/v1/recipes?user_created_only=true",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2  # Only user's recipes
        
        recipe_names = [recipe["recipe_name"] for recipe in data]
        assert "User Recipe 1" in recipe_names
        assert "User Recipe 2" in recipe_names
        assert "System Recipe" not in recipe_names
        
        # Verify all returned recipes belong to the user
        for recipe in data:
            assert recipe["created_by_user_id"] == test_user.id
    
    def test_user_created_only_false_includes_system_recipes(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test that user_created_only=false (or not specified) includes both user and system recipes
        """
        # Create user recipe
        user_recipe = RecipeCreate(
            recipe_name="User Recipe",
            instructions="User instructions",
            estimated_calories=300,
            ingredients=[]
        )
        
        # Create system recipe
        system_recipe = RecipeCreate(
            recipe_name="System Recipe",
            instructions="System instructions", 
            estimated_calories=400,
            ingredients=[]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=user_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=system_recipe, user_id=None)
        
        # Test default behavior (should include both)
        response = client.get(
            "/api/v1/recipes",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2  # Both user and system recipes
        
        recipe_names = [recipe["recipe_name"] for recipe in data]
        assert "User Recipe" in recipe_names
        assert "System Recipe" in recipe_names
    
    def test_ac_3_2_2_max_calories_filter(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        AC3.2.2: Pedido GET /recipes?max_calories=500
        """
        # Create recipes with different calorie counts
        low_calorie_recipe = RecipeCreate(
            recipe_name="Low Calorie Recipe",
            instructions="Low calorie instructions",
            estimated_calories=300,
            ingredients=[]
        )
        medium_calorie_recipe = RecipeCreate(
            recipe_name="Medium Calorie Recipe",
            instructions="Medium calorie instructions",
            estimated_calories=500,  # Exactly at limit
            ingredients=[]
        )
        high_calorie_recipe = RecipeCreate(
            recipe_name="High Calorie Recipe",
            instructions="High calorie instructions",
            estimated_calories=800,  # Above limit
            ingredients=[]
        )
        no_calorie_info_recipe = RecipeCreate(
            recipe_name="No Calorie Info",
            instructions="No calorie info",
            estimated_calories=None,  # No calorie information
            ingredients=[]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=low_calorie_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=medium_calorie_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=high_calorie_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=no_calorie_info_recipe, user_id=test_user.id)
        
        # Test max_calories filter
        response = client.get(
            "/api/v1/recipes?max_calories=500",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2  # Only recipes with <= 500 calories
        
        recipe_names = [recipe["recipe_name"] for recipe in data]
        assert "Low Calorie Recipe" in recipe_names
        assert "Medium Calorie Recipe" in recipe_names
        assert "High Calorie Recipe" not in recipe_names
        assert "No Calorie Info" not in recipe_names  # Excluded because no calorie info
        
        # Verify calorie limits
        for recipe in data:
            assert recipe["estimated_calories"] is not None
            assert recipe["estimated_calories"] <= 500
    
    def test_ac_3_2_3_max_prep_time_filter(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        AC3.2.3: Pedido GET /recipes?max_prep_time=30
        """
        # Create recipes with different preparation times
        quick_recipe = RecipeCreate(
            recipe_name="Quick Recipe",
            instructions="Quick instructions",
            preparation_time_minutes=15,
            ingredients=[]
        )
        medium_time_recipe = RecipeCreate(
            recipe_name="Medium Time Recipe",
            instructions="Medium time instructions",
            preparation_time_minutes=30,  # Exactly at limit
            ingredients=[]
        )
        slow_recipe = RecipeCreate(
            recipe_name="Slow Recipe",
            instructions="Slow instructions",
            preparation_time_minutes=60,  # Above limit
            ingredients=[]
        )
        no_time_info_recipe = RecipeCreate(
            recipe_name="No Time Info",
            instructions="No time info",
            preparation_time_minutes=None,  # No time information
            ingredients=[]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=quick_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=medium_time_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=slow_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=no_time_info_recipe, user_id=test_user.id)
        
        # Test max_prep_time filter
        response = client.get(
            "/api/v1/recipes?max_prep_time=30",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2  # Only recipes with <= 30 minutes prep time
        
        recipe_names = [recipe["recipe_name"] for recipe in data]
        assert "Quick Recipe" in recipe_names
        assert "Medium Time Recipe" in recipe_names
        assert "Slow Recipe" not in recipe_names
        assert "No Time Info" not in recipe_names  # Excluded because no time info
        
        # Verify time limits
        for recipe in data:
            assert recipe["preparation_time_minutes"] is not None
            assert recipe["preparation_time_minutes"] <= 30
    
    def test_ac_3_2_4_ingredients_filter(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        AC3.2.4: Pedido GET /recipes?ingredients=Maçã&ingredients=Nozes
        """
        # Create recipes with different ingredients
        apple_walnut_recipe = RecipeCreate(
            recipe_name="Apple Walnut Recipe",
            instructions="Apple and walnut instructions",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Maçã", required_quantity=2.0, required_unit="units"),
                RecipeIngredientCreate(ingredient_name="Nozes", required_quantity=0.5, required_unit="cup"),
                RecipeIngredientCreate(ingredient_name="Açúcar", required_quantity=1.0, required_unit="tbsp")
            ]
        )
        
        apple_only_recipe = RecipeCreate(
            recipe_name="Apple Only Recipe",
            instructions="Apple only instructions",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Maçã", required_quantity=3.0, required_unit="units"),
                RecipeIngredientCreate(ingredient_name="Canela", required_quantity=1.0, required_unit="tsp")
            ]
        )
        
        walnut_only_recipe = RecipeCreate(
            recipe_name="Walnut Only Recipe",
            instructions="Walnut only instructions",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Nozes", required_quantity=1.0, required_unit="cup"),
                RecipeIngredientCreate(ingredient_name="Mel", required_quantity=2.0, required_unit="tbsp")
            ]
        )
        
        no_match_recipe = RecipeCreate(
            recipe_name="No Match Recipe",
            instructions="No matching ingredients",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Banana", required_quantity=2.0, required_unit="units"),
                RecipeIngredientCreate(ingredient_name="Leite", required_quantity=1.0, required_unit="cup")
            ]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=apple_walnut_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=apple_only_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=walnut_only_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=no_match_recipe, user_id=test_user.id)
        
        # Test ingredients filter (should only return recipes that contain ALL specified ingredients)
        response = client.get(
            "/api/v1/recipes?ingredients=Maçã&ingredients=Nozes",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1  # Only recipe with both apples and walnuts
        
        recipe = data[0]
        assert recipe["recipe_name"] == "Apple Walnut Recipe"
        
        # Verify the recipe contains both required ingredients
        ingredient_names = [ing["ingredient_name"] for ing in recipe["ingredients"]]
        assert "Maçã" in ingredient_names
        assert "Nozes" in ingredient_names
    
    def test_single_ingredient_filter(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test filtering by a single ingredient
        """
        # Create recipes with and without apples
        apple_recipe = RecipeCreate(
            recipe_name="Apple Recipe",
            instructions="Apple instructions",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Maçã", required_quantity=2.0, required_unit="units")
            ]
        )
        
        banana_recipe = RecipeCreate(
            recipe_name="Banana Recipe", 
            instructions="Banana instructions",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Banana", required_quantity=1.0, required_unit="unit")
            ]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=apple_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=banana_recipe, user_id=test_user.id)
        
        # Test single ingredient filter
        response = client.get(
            "/api/v1/recipes?ingredients=Maçã",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["recipe_name"] == "Apple Recipe"
    
    def test_combined_filters(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test combining multiple filters together
        """
        # Create recipe that matches all criteria
        matching_recipe = RecipeCreate(
            recipe_name="Perfect Match",
            instructions="Perfect match instructions",
            estimated_calories=400,
            preparation_time_minutes=25,
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Maçã", required_quantity=1.0, required_unit="unit")
            ]
        )
        
        # Create recipe with too many calories
        high_calorie_recipe = RecipeCreate(
            recipe_name="Too Many Calories",
            instructions="High calorie instructions",
            estimated_calories=600,  # Above limit
            preparation_time_minutes=20,
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Maçã", required_quantity=1.0, required_unit="unit")
            ]
        )
        
        # Create recipe with too much prep time
        slow_recipe = RecipeCreate(
            recipe_name="Too Slow",
            instructions="Slow instructions",
            estimated_calories=300,
            preparation_time_minutes=45,  # Above limit
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Maçã", required_quantity=1.0, required_unit="unit")
            ]
        )
        
        # Create recipe without required ingredient
        wrong_ingredient_recipe = RecipeCreate(
            recipe_name="Wrong Ingredient",
            instructions="Wrong ingredient instructions",
            estimated_calories=350,
            preparation_time_minutes=20,
            ingredients=[
                RecipeIngredientCreate(ingredient_name="Banana", required_quantity=1.0, required_unit="unit")
            ]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=matching_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=high_calorie_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=slow_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=wrong_ingredient_recipe, user_id=test_user.id)
        
        # Test combined filters
        response = client.get(
            "/api/v1/recipes?max_calories=500&max_prep_time=30&ingredients=Maçã&user_created_only=true",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1  # Only the perfect match
        assert data[0]["recipe_name"] == "Perfect Match"
        assert data[0]["estimated_calories"] <= 500
        assert data[0]["preparation_time_minutes"] <= 30
        assert data[0]["created_by_user_id"] == test_user.id
        
        # Verify it contains the required ingredient
        ingredient_names = [ing["ingredient_name"] for ing in data[0]["ingredients"]]
        assert "Maçã" in ingredient_names
    
    def test_empty_filters_return_all_accessible_recipes(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test that when no filters are applied, all accessible recipes are returned
        """
        # Create user recipe
        user_recipe = RecipeCreate(
            recipe_name="User Recipe",
            instructions="User instructions",
            ingredients=[]
        )
        
        # Create system recipe
        system_recipe = RecipeCreate(
            recipe_name="System Recipe",
            instructions="System instructions",
            ingredients=[]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=user_recipe, user_id=test_user.id)
        crud_recipe.create_with_user(session_fixture, obj_in=system_recipe, user_id=None)
        
        # Test no filters (should return both accessible recipes)
        response = client.get(
            "/api/v1/recipes",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 2  # Both user and system recipes
        
        recipe_names = [recipe["recipe_name"] for recipe in data]
        assert "User Recipe" in recipe_names
        assert "System Recipe" in recipe_names
    
    def test_case_insensitive_ingredient_search(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test that ingredient filtering is case insensitive
        """
        recipe_with_apple = RecipeCreate(
            recipe_name="Recipe with Apple",
            instructions="Instructions",
            ingredients=[
                RecipeIngredientCreate(ingredient_name="maçã", required_quantity=1.0, required_unit="unit")  # lowercase
            ]
        )
        
        crud_recipe.create_with_user(session_fixture, obj_in=recipe_with_apple, user_id=test_user.id)
        
        # Test case insensitive search (searching for "Maçã" should find "maçã")
        response = client.get(
            "/api/v1/recipes?ingredients=Maçã",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["recipe_name"] == "Recipe with Apple"
    
    def test_pagination_with_filters(self, client: TestClient, test_user_token: str, session_fixture: Session, test_user: User):
        """
        Test that pagination works correctly with filters
        """
        # Create multiple recipes that match filter criteria
        for i in range(5):
            recipe = RecipeCreate(
                recipe_name=f"Recipe {i+1}",
                instructions=f"Instructions {i+1}",
                estimated_calories=300,  # All under 500 calories
                ingredients=[]
            )
            crud_recipe.create_with_user(session_fixture, obj_in=recipe, user_id=test_user.id)
        
        # Test pagination with filters
        response = client.get(
            "/api/v1/recipes?max_calories=500&limit=3",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 3  # Limited to 3 results
        
        # All should match the filter criteria
        for recipe in data:
            assert recipe["estimated_calories"] <= 500
