"""
Comprehensive unit tests for US4.3 - User Preference-Based Recipe Recommendations
Tests the preference logic integration in the recommendation system.
"""

import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user_models import User
from app.models.recipe_models import Recipe, RecipeIngredient
from app.models.pantry_models import PantryItem
from app.models.user_preference_models import UserPreference
from app.schemas.user import UserCreate
from app.schemas.recommendations import RecommendationFilters, RecommendationSort
from app.services.recommendation_service import RecommendationService
from app.crud.crud_user import user as crud_user
from app.crud.crud_user_preferences import user_preference as crud_user_preferences


@pytest.fixture
def recommendation_service():
    """Create a recommendation service instance for testing"""
    return RecommendationService()


@pytest.fixture
def test_recipes(session_fixture: Session, test_user: User):
    """Create test recipes with different characteristics for preference testing"""
    recipes = []
    
    # Recipe 1: Vegetarian Italian Easy
    recipe1 = Recipe(
        recipe_name="Pasta Vegetariana",
        instructions="Cook pasta, add vegetables",
        estimated_calories=450,
        preparation_time_minutes=20,
        cuisine_type="italian",
        difficulty_level="easy",
        dietary_tags=["vegetarian"],
        created_by_user_id=None  # System recipe
    )
    session_fixture.add(recipe1)
    session_fixture.commit()
    session_fixture.refresh(recipe1)
    
    # Add ingredients for recipe1
    ingredient1 = RecipeIngredient(
        recipe_id=recipe1.id,
        ingredient_name="pasta",
        required_quantity="200",
        required_unit="g"
    )
    ingredient2 = RecipeIngredient(
        recipe_id=recipe1.id,
        ingredient_name="tomato",
        required_quantity="2",
        required_unit="pieces"
    )
    session_fixture.add(ingredient1)
    session_fixture.add(ingredient2)
    recipes.append(recipe1)
    
    # Recipe 2: Vegan Asian Medium
    recipe2 = Recipe(
        recipe_name="Tofu Stir Fry",
        instructions="Stir fry tofu with vegetables",
        estimated_calories=320,
        preparation_time_minutes=30,
        cuisine_type="asian",
        difficulty_level="medium",
        dietary_tags=["vegan", "vegetarian"],
        created_by_user_id=None
    )
    session_fixture.add(recipe2)
    session_fixture.commit()
    session_fixture.refresh(recipe2)
    
    # Add ingredients for recipe2
    ingredient3 = RecipeIngredient(
        recipe_id=recipe2.id,
        ingredient_name="tofu",
        required_quantity="200",
        required_unit="g"
    )
    ingredient4 = RecipeIngredient(
        recipe_id=recipe2.id,
        ingredient_name="soy sauce",
        required_quantity="2",
        required_unit="tbsp"
    )
    session_fixture.add(ingredient3)
    session_fixture.add(ingredient4)
    recipes.append(recipe2)
    
    # Recipe 3: Non-vegetarian Portuguese Hard
    recipe3 = Recipe(
        recipe_name="Bacalhau à Brás",
        instructions="Traditional Portuguese cod dish",
        estimated_calories=600,
        preparation_time_minutes=60,
        cuisine_type="portuguese",
        difficulty_level="hard",
        dietary_tags=[],
        created_by_user_id=None
    )
    session_fixture.add(recipe3)
    session_fixture.commit()
    session_fixture.refresh(recipe3)
    
    # Add ingredients for recipe3
    ingredient5 = RecipeIngredient(
        recipe_id=recipe3.id,
        ingredient_name="cod",
        required_quantity="300",
        required_unit="g"
    )
    ingredient6 = RecipeIngredient(
        recipe_id=recipe3.id,
        ingredient_name="potato",
        required_quantity="4",
        required_unit="pieces"
    )
    session_fixture.add(ingredient5)
    session_fixture.add(ingredient6)
    recipes.append(recipe3)
    
    # Recipe 4: Gluten-free Healthy Easy
    recipe4 = Recipe(
        recipe_name="Quinoa Salad",
        instructions="Mix quinoa with fresh vegetables",
        estimated_calories=280,
        preparation_time_minutes=15,
        cuisine_type="healthy",
        difficulty_level="easy",
        dietary_tags=["gluten_free", "vegetarian"],
        created_by_user_id=None
    )
    session_fixture.add(recipe4)
    session_fixture.commit()
    session_fixture.refresh(recipe4)
    
    # Add ingredients for recipe4
    ingredient7 = RecipeIngredient(
        recipe_id=recipe4.id,
        ingredient_name="quinoa",
        required_quantity="150",
        required_unit="g"
    )
    ingredient8 = RecipeIngredient(
        recipe_id=recipe4.id,
        ingredient_name="cucumber",
        required_quantity="1",
        required_unit="piece"
    )
    session_fixture.add(ingredient7)
    session_fixture.add(ingredient8)
    recipes.append(recipe4)
    
    session_fixture.commit()
    return recipes


@pytest.fixture
def test_pantry_items(session_fixture: Session, test_user: User):
    """Create test pantry items for the user"""
    items = []
    
    # Available ingredients
    item1 = PantryItem(
        user_id=test_user.id,
        item_name="pasta",
        quantity="500",
        unit="g",
        expiration_date=date.today() + timedelta(days=30)
    )
    item2 = PantryItem(
        user_id=test_user.id,
        item_name="tomato",
        quantity="5",
        unit="pieces",
        expiration_date=date.today() + timedelta(days=3)  # Expiring soon
    )
    item3 = PantryItem(
        user_id=test_user.id,
        item_name="tofu",
        quantity="300",
        unit="g",
        expiration_date=date.today() + timedelta(days=10)
    )
    item4 = PantryItem(
        user_id=test_user.id,
        item_name="quinoa",
        quantity="200",
        unit="g",
        expiration_date=date.today() + timedelta(days=60)
    )
    
    items.extend([item1, item2, item3, item4])
    
    for item in items:
        session_fixture.add(item)
    
    session_fixture.commit()
    return items


class TestUserPreferenceEndpoints:
    """Test user preference API endpoints (AC4.3.4)"""
    
    def test_get_preference_options_public(self, client: TestClient):
        """Test getting available preference options without authentication"""
        response = client.get("/api/v1/user/preferences/options")
        assert response.status_code == 200
        
        data = response.json()
        assert "dietary_restrictions" in data
        assert "cuisine_types" in data
        assert "difficulty_levels" in data
        
        # Verify expected options are present
        assert "vegetarian" in data["dietary_restrictions"]
        assert "vegan" in data["dietary_restrictions"]
        assert "gluten_free" in data["dietary_restrictions"]
        assert "italian" in data["cuisine_types"]
        assert "portuguese" in data["cuisine_types"]
        assert "easy" in data["difficulty_levels"]
    
    def test_get_user_preferences_requires_auth(self, client: TestClient):
        """Test that getting user preferences requires authentication"""
        response = client.get("/api/v1/user/preferences")
        assert response.status_code == 403
    
    def test_create_user_preferences_requires_auth(self, client: TestClient):
        """Test that creating user preferences requires authentication"""
        preference_data = {
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["italian"],
            "preferred_difficulty": "easy"
        }
        response = client.post("/api/v1/user/preferences", json=preference_data)
        assert response.status_code == 403
    
    def test_update_user_preferences_requires_auth(self, client: TestClient):
        """Test that updating user preferences requires authentication"""
        preference_data = {
            "dietary_restrictions": ["vegan"],
            "preferred_cuisines": ["asian"],
            "preferred_difficulty": "medium"
        }
        response = client.put("/api/v1/user/preferences", json=preference_data)
        assert response.status_code == 403
    
    def test_get_user_preferences_authenticated(self, client: TestClient, test_user_token: str):
        """Test getting user preferences when authenticated"""
        response = client.get(
            "/api/v1/user/preferences",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        # Should return default preferences or user's saved preferences
        assert "dietary_restrictions" in data
        assert "preferred_cuisines" in data
        assert "preferred_difficulty" in data
    
    def test_create_user_preferences_authenticated(self, client: TestClient, test_user_token: str):
        """Test creating user preferences when authenticated"""
        preference_data = {
            "dietary_restrictions": ["vegetarian", "gluten_free"],
            "preferred_cuisines": ["italian", "healthy"],
            "preferred_difficulty": "easy",
            "daily_calorie_goal": 2000,
            "max_prep_time_preference": 30,
            "prioritize_expiring_ingredients": True
        }
        
        response = client.post(
            "/api/v1/user/preferences",
            json=preference_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 201
        
        data = response.json()
        assert data["dietary_restrictions"] == ["vegetarian", "gluten_free"]
        assert data["preferred_cuisines"] == ["italian", "healthy"]
        assert data["preferred_difficulty"] == "easy"
        assert data["daily_calorie_goal"] == 2000
    
    def test_update_user_preferences_authenticated(self, client: TestClient, test_user_token: str):
        """Test updating user preferences when authenticated"""
        # First create preferences
        initial_data = {
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["italian"],
            "preferred_difficulty": "easy"
        }
        
        client.post(
            "/api/v1/user/preferences",
            json=initial_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        # Then update them
        updated_data = {
            "dietary_restrictions": ["vegan"],
            "preferred_cuisines": ["asian", "healthy"],
            "preferred_difficulty": "medium",
            "max_prep_time_preference": 45
        }
        
        response = client.put(
            "/api/v1/user/preferences",
            json=updated_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["dietary_restrictions"] == ["vegan"]
        assert data["preferred_cuisines"] == ["asian", "healthy"]
        assert data["preferred_difficulty"] == "medium"
        assert data["max_prep_time_preference"] == 45


class TestDietaryRestrictionFiltering:
    """Test AC4.3.1: Sistema considera restrições dietéticas do utilizador"""
    
    def test_vegetarian_filtering(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that vegetarian users only see vegetarian recipes"""
        # Create vegetarian user preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["vegetarian"],
            preferred_cuisines=[],
            preferred_difficulty="easy"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return vegetarian recipes
        assert len(result.recommendations) > 0
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.dietary_tags is not None
            assert "vegetarian" in recipe.dietary_tags
    
    def test_vegan_filtering(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that vegan users only see vegan recipes"""
        # Create vegan user preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["vegan"],
            preferred_cuisines=[],
            preferred_difficulty="medium"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return vegan recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.dietary_tags is not None
            assert "vegan" in recipe.dietary_tags
    
    def test_gluten_free_filtering(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that gluten-free users only see gluten-free recipes"""
        # Create gluten-free user preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["gluten_free"],
            preferred_cuisines=[],
            preferred_difficulty="easy"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return gluten-free recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.dietary_tags is not None
            assert "gluten_free" in recipe.dietary_tags
    
    def test_multiple_dietary_restrictions(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test multiple dietary restrictions are applied correctly"""
        # Create user with multiple restrictions
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["vegetarian", "gluten_free"],
            preferred_cuisines=[],
            preferred_difficulty="easy"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return recipes that satisfy ALL restrictions
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.dietary_tags is not None
            assert "vegetarian" in recipe.dietary_tags
            assert "gluten_free" in recipe.dietary_tags


class TestCuisineTypeFiltering:
    """Test AC4.3.2: Filtra receitas por tipos de culinária preferidos"""
    
    def test_italian_cuisine_preference(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that users preferring Italian cuisine get Italian recipes prioritized"""
        # Create user with Italian cuisine preference
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=["italian"],
            preferred_difficulty="easy"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return Italian recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.cuisine_type == "italian"
    
    def test_asian_cuisine_preference(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that users preferring Asian cuisine get Asian recipes"""
        # Create user with Asian cuisine preference
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=["asian"],
            preferred_difficulty="medium"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return Asian recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.cuisine_type == "asian"
    
    def test_multiple_cuisine_preferences(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test multiple cuisine preferences"""
        # Create user with multiple cuisine preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=["italian", "healthy"],
            preferred_difficulty="easy"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should return recipes from preferred cuisines
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.cuisine_type in ["italian", "healthy"]


class TestDifficultyLevelFiltering:
    """Test AC4.3.3: Considera nível de dificuldade preferido"""
    
    def test_easy_difficulty_preference(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that users preferring easy recipes only get easy recipes"""
        # Create user with easy difficulty preference
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=[],
            preferred_difficulty="easy"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return easy recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.difficulty_level == "easy"
    
    def test_medium_difficulty_preference(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that users preferring medium recipes only get medium recipes"""
        # Create user with medium difficulty preference
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=[],
            preferred_difficulty="medium"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return medium recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.difficulty_level == "medium"
    
    def test_hard_difficulty_preference(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that users preferring hard recipes only get hard recipes"""
        # Create user with hard difficulty preference
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=[],
            preferred_difficulty="hard"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should only return hard recipes
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            assert recipe.difficulty_level == "hard"


class TestPreferenceBasedScoring:
    """Test AC4.3.5: Recomendações ajustam automaticamente pontuações com base nas preferências"""
    
    def test_preference_bonus_scoring(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that recipes matching preferences get bonus scores"""
        # Create user with specific preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["vegetarian"],
            preferred_cuisines=["italian"],
            preferred_difficulty="easy",
            prioritize_expiring_ingredients=True
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations with preferences
        result_with_prefs = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Get recommendations without preferences
        result_without_prefs = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=False
        )
        
        # Find the Italian vegetarian easy recipe in both results
        italian_recipe_with_prefs = None
        italian_recipe_without_prefs = None
        
        for rec in result_with_prefs.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            if (recipe.cuisine_type == "italian" and 
                recipe.dietary_tags and "vegetarian" in recipe.dietary_tags and 
                recipe.difficulty_level == "easy"):
                italian_recipe_with_prefs = rec
                break
        
        for rec in result_without_prefs.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            if (recipe.cuisine_type == "italian" and 
                recipe.dietary_tags and "vegetarian" in recipe.dietary_tags and 
                recipe.difficulty_level == "easy"):
                italian_recipe_without_prefs = rec
                break
        
        # Score with preferences should be higher due to bonuses
        if italian_recipe_with_prefs and italian_recipe_without_prefs:
            assert italian_recipe_with_prefs.match_score > italian_recipe_without_prefs.match_score
    
    def test_expiring_ingredient_priority(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that recipes using expiring ingredients get priority when preference is set"""
        # Create user who prioritizes expiring ingredients
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=[],
            preferred_difficulty="easy",
            prioritize_expiring_ingredients=True
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Find recipes that use expiring ingredients (tomato expires in 3 days)
        recipes_with_expiring = []
        recipes_without_expiring = []
        
        for rec in result.recommendations:
            if rec.expiring_ingredients_used:
                recipes_with_expiring.append(rec)
            else:
                recipes_without_expiring.append(rec)
        
        # Recipes with expiring ingredients should generally have higher scores
        if recipes_with_expiring and recipes_without_expiring:
            avg_score_with_expiring = sum(r.match_score for r in recipes_with_expiring) / len(recipes_with_expiring)
            avg_score_without_expiring = sum(r.match_score for r in recipes_without_expiring) / len(recipes_without_expiring)
            assert avg_score_with_expiring >= avg_score_without_expiring
    
    def test_calorie_and_prep_time_filtering(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that calorie and prep time preferences filter recipes correctly"""
        # Create user with strict calorie and time preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=[],
            preferred_cuisines=[],
            preferred_difficulty="easy",
            max_calories_preference=400,  # Should exclude high-calorie recipes
            max_prep_time_preference=25   # Should exclude long prep time recipes
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # All returned recipes should meet the calorie and time constraints
        for rec in result.recommendations:
            if rec.estimated_calories is not None:
                assert rec.estimated_calories <= 400
            if rec.preparation_time_minutes is not None:
                assert rec.preparation_time_minutes <= 25


class TestPreferenceIntegration:
    """Test complete preference integration scenarios"""
    
    def test_preferences_can_be_disabled(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that preferences can be disabled via use_preferences=False"""
        # Create strict user preferences
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["vegan"],
            preferred_cuisines=["asian"],
            preferred_difficulty="hard"
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations with preferences disabled
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=False
        )
        
        # Should return all recipes that match pantry items, regardless of preferences
        assert len(result.recommendations) > 0
        
        # Check that non-vegan, non-Asian, non-hard recipes are included
        non_matching_found = False
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            if (recipe.cuisine_type != "asian" or 
                recipe.difficulty_level != "hard" or
                not recipe.dietary_tags or "vegan" not in recipe.dietary_tags):
                non_matching_found = True
                break
        
        assert non_matching_found, "Should include recipes that don't match strict preferences when disabled"
    
    def test_combined_preference_filtering(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test that all preference types work together correctly"""
        # Create user with multiple preference types
        preferences = UserPreference(
            user_id=test_user.id,
            dietary_restrictions=["vegetarian"],
            preferred_cuisines=["italian", "healthy"],
            preferred_difficulty="easy",
            max_calories_preference=500,
            max_prep_time_preference=30,
            prioritize_expiring_ingredients=True
        )
        session_fixture.add(preferences)
        session_fixture.commit()
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Verify all preferences are applied
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            
            # Check dietary restrictions
            assert recipe.dietary_tags is not None
            assert "vegetarian" in recipe.dietary_tags
            
            # Check cuisine type
            assert recipe.cuisine_type in ["italian", "healthy"]
            
            # Check difficulty
            assert recipe.difficulty_level == "easy"
            
            # Check calories
            if rec.estimated_calories is not None:
                assert rec.estimated_calories <= 500
            
            # Check prep time
            if rec.preparation_time_minutes is not None:
                assert rec.preparation_time_minutes <= 30
    
    def test_no_preferences_set(self, session_fixture: Session, test_user: User, test_recipes, test_pantry_items, recommendation_service):
        """Test behavior when user has no preferences set"""
        # Don't create any preferences for the user
        
        # Get recommendations
        result = recommendation_service.get_recommendations(
            db=session_fixture,
            user_id=test_user.id,
            use_preferences=True
        )
        
        # Should return all recipes that match pantry items
        assert len(result.recommendations) > 0
        
        # Should include recipes of different types since no preferences restrict them
        cuisine_types = set()
        difficulty_levels = set()
        
        for rec in result.recommendations:
            recipe = session_fixture.get(Recipe, rec.recipe_id)
            if recipe.cuisine_type:
                cuisine_types.add(recipe.cuisine_type)
            if recipe.difficulty_level:
                difficulty_levels.add(recipe.difficulty_level)
        
        # Should have variety since no preferences are filtering
        assert len(cuisine_types) > 1 or len(difficulty_levels) > 1


class TestPreferenceValidation:
    """Test preference validation"""
    
    def test_preference_validation_via_api(self, client: TestClient, test_user_token: str):
        """Test that invalid preference data is rejected by the API"""
        # Test invalid dietary restriction
        invalid_data = {
            "dietary_restrictions": ["invalid_diet"],
            "preferred_cuisines": ["italian"],
            "preferred_difficulty": "easy"
        }
        
        response = client.post(
            "/api/v1/user/preferences",
            json=invalid_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422
        
        # Test invalid cuisine type
        invalid_data = {
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["invalid_cuisine"],
            "preferred_difficulty": "easy"
        }
        
        response = client.post(
            "/api/v1/user/preferences",
            json=invalid_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422
        
        # Test invalid difficulty level
        invalid_data = {
            "dietary_restrictions": ["vegetarian"],
            "preferred_cuisines": ["italian"],
            "preferred_difficulty": "invalid_difficulty"
        }
        
        response = client.post(
            "/api/v1/user/preferences",
            json=invalid_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422
    
    def test_valid_preference_data_accepted(self, client: TestClient, test_user_token: str):
        """Test that valid preference data is accepted"""
        valid_data = {
            "dietary_restrictions": ["vegetarian", "gluten_free"],
            "preferred_cuisines": ["italian", "portuguese", "healthy"],
            "preferred_difficulty": "medium",
            "daily_calorie_goal": 2200,
            "max_prep_time_preference": 45,
            "max_calories_preference": 600,
            "prioritize_expiring_ingredients": True
        }
        
        response = client.post(
            "/api/v1/user/preferences",
            json=valid_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 201
        
        data = response.json()
        assert data["dietary_restrictions"] == ["vegetarian", "gluten_free"]
        assert data["preferred_cuisines"] == ["italian", "portuguese", "healthy"]
        assert data["preferred_difficulty"] == "medium"
        assert data["daily_calorie_goal"] == 2200
        assert data["prioritize_expiring_ingredients"] is True
