import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from datetime import datetime

from app.models.user_models import User
from app.models.recipe_models import Recipe, RecipeIngredient


class TestRecipeEndpoints:
    """Test suite for recipe endpoints"""

    def test_create_recipe_success(self, client: TestClient, test_user_token: str):
        """Test successful creation of a recipe"""
        recipe_data = {
            "recipe_name": "Spaghetti Carbonara",
            "instructions": "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine everything.",
            "estimated_calories": 450,
            "preparation_time_minutes": 30,
            "image_url": "https://example.com/carbonara.jpg",
            "ingredients": [
                {
                    "ingredient_name": "Spaghetti",
                    "required_quantity": 200.0,
                    "required_unit": "grams"
                },
                {
                    "ingredient_name": "Eggs",
                    "required_quantity": 2.0,
                    "required_unit": "pieces"
                }
            ]
        }
        
        response = client.post(
            "/api/v1/recipes/",
            json=recipe_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["recipe_name"] == "Spaghetti Carbonara"
        assert data["instructions"] == "1. Cook pasta. 2. Mix eggs and cheese. 3. Combine everything."
        assert data["estimated_calories"] == 450
        assert data["preparation_time_minutes"] == 30
        assert data["image_url"] == "https://example.com/carbonara.jpg"
        assert "id" in data
        assert "created_by_user_id" in data
        assert "created_at" in data
        assert len(data["ingredients"]) == 2
        assert data["ingredients"][0]["ingredient_name"] == "Spaghetti"
        assert data["ingredients"][1]["ingredient_name"] == "Eggs"

    def test_create_recipe_minimal_data(self, client: TestClient, test_user_token: str):
        """Test creating recipe with only required fields"""
        recipe_data = {
            "recipe_name": "Simple Toast",
            "instructions": "Toast the bread.",
            "ingredients": []
        }
        
        response = client.post(
            "/api/v1/recipes/",
            json=recipe_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["recipe_name"] == "Simple Toast"
        assert data["instructions"] == "Toast the bread."
        assert data["estimated_calories"] is None
        assert data["preparation_time_minutes"] is None
        assert data["image_url"] is None
        assert len(data["ingredients"]) == 0

    def test_create_recipe_without_auth(self, client: TestClient):
        """Test creating recipe without authentication"""
        recipe_data = {
            "recipe_name": "Unauthorized Recipe",
            "instructions": "This should fail.",
            "ingredients": []
        }
        
        response = client.post("/api/v1/recipes/", json=recipe_data)
        assert response.status_code == 403

    def test_create_recipe_invalid_token(self, client: TestClient):
        """Test creating recipe with invalid token"""
        recipe_data = {
            "recipe_name": "Invalid Token Recipe",
            "instructions": "This should fail.",
            "ingredients": []
        }
        
        response = client.post(
            "/api/v1/recipes/",
            json=recipe_data,
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_create_recipe_missing_required_fields(self, client: TestClient, test_user_token: str):
        """Test creating recipe with missing required fields"""
        # Missing recipe_name
        response = client.post(
            "/api/v1/recipes/",
            json={"instructions": "Missing name", "ingredients": []},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422

        # Missing instructions
        response = client.post(
            "/api/v1/recipes/",
            json={"recipe_name": "Missing Instructions", "ingredients": []},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422

    def test_get_recipes_empty(self, client: TestClient, test_user_token: str):
        """Test getting recipes when user has none"""
        response = client.get(
            "/api/v1/recipes/",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_recipes_with_data(self, client: TestClient, test_user_token: str):
        """Test getting recipes when user has recipes"""
        # Create some recipes first
        recipes_data = [
            {
                "recipe_name": "Recipe 1",
                "instructions": "Instructions 1",
                "ingredients": []
            },
            {
                "recipe_name": "Recipe 2",
                "instructions": "Instructions 2",
                "ingredients": []
            },
            {
                "recipe_name": "Recipe 3",
                "instructions": "Instructions 3",
                "ingredients": []
            }
        ]
        
        created_recipes = []
        for recipe_data in recipes_data:
            response = client.post(
                "/api/v1/recipes/",
                json=recipe_data,
                headers={"Authorization": f"Bearer {test_user_token}"}
            )
            assert response.status_code == 200
            created_recipes.append(response.json())
        
        # Get all recipes
        response = client.get(
            "/api/v1/recipes/",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3
        
        # Check that all created recipes are returned
        recipe_names = [recipe["recipe_name"] for recipe in data]
        assert "Recipe 1" in recipe_names
        assert "Recipe 2" in recipe_names
        assert "Recipe 3" in recipe_names

    def test_get_recipes_without_auth(self, client: TestClient):
        """Test getting recipes without authentication"""
        response = client.get("/api/v1/recipes/")
        assert response.status_code == 403

    def test_get_recipes_invalid_token(self, client: TestClient):
        """Test getting recipes with invalid token"""
        response = client.get(
            "/api/v1/recipes/",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_get_recipes_pagination(self, client: TestClient, test_user_token: str):
        """Test pagination parameters for getting recipes"""
        # Create multiple recipes
        for i in range(5):
            recipe_data = {
                "recipe_name": f"Recipe {i}",
                "instructions": f"Instructions {i}",
                "ingredients": []
            }
            response = client.post(
                "/api/v1/recipes/",
                json=recipe_data,
                headers={"Authorization": f"Bearer {test_user_token}"}
            )
            assert response.status_code == 200
        
        # Test with limit
        response = client.get(
            "/api/v1/recipes/?limit=3",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        
        # Test with skip
        response = client.get(
            "/api/v1/recipes/?skip=2",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3  # 5 total - 2 skipped = 3
        
        # Test with both skip and limit
        response = client.get(
            "/api/v1/recipes/?skip=1&limit=2",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_recipe_by_id_success(self, client: TestClient, test_user_token: str):
        """Test getting a specific recipe by ID"""
        # Create a recipe first
        recipe_data = {
            "recipe_name": "Test Recipe",
            "instructions": "Test instructions",
            "ingredients": [
                {
                    "ingredient_name": "Test Ingredient",
                    "required_quantity": 1.0,
                    "required_unit": "piece"
                }
            ]
        }
        
        create_response = client.post(
            "/api/v1/recipes/",
            json=recipe_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert create_response.status_code == 200
        created_recipe = create_response.json()
        recipe_id = created_recipe["id"]
        
        # Get the recipe by ID
        response = client.get(
            f"/api/v1/recipes/{recipe_id}",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == recipe_id
        assert data["recipe_name"] == "Test Recipe"
        assert data["instructions"] == "Test instructions"
        assert len(data["ingredients"]) == 1
        assert data["ingredients"][0]["ingredient_name"] == "Test Ingredient"

    def test_get_recipe_by_id_not_found(self, client: TestClient, test_user_token: str):
        """Test getting a recipe by non-existent ID"""
        response = client.get(
            "/api/v1/recipes/99999",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 404
        assert "Recipe not found" in response.json()["detail"]

    def test_get_recipe_by_id_without_auth(self, client: TestClient):
        """Test getting recipe by ID without authentication"""
        response = client.get("/api/v1/recipes/1")
        assert response.status_code == 403

    def test_get_recipe_by_id_invalid_token(self, client: TestClient):
        """Test getting recipe by ID with invalid token"""
        response = client.get(
            "/api/v1/recipes/1",
            headers={"Authorization": "Bearer invalid_token"}
        )
        assert response.status_code == 401

    def test_recipe_access_permissions(self, client: TestClient, test_user_token: str, session_fixture: Session):
        """Test that users can only access their own recipes or system recipes"""
        # Create a second user
        from app.crud.crud_user import user as crud_user
        from app.schemas.user import UserCreate
        
        user2_data = UserCreate(
            email="user2@example.com",
            username="testuser2",
            password="testpassword456"
        )
        user2 = crud_user.create(session_fixture, obj_in=user2_data)
        
        # Login as second user
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "user2@example.com", "password": "testpassword456"}
        )
        assert login_response.status_code == 200
        user2_token = login_response.json()["access_token"]
        
        # Create recipe for first user
        recipe_data = {
            "recipe_name": "User1 Recipe",
            "instructions": "User1 instructions",
            "ingredients": []
        }
        response1 = client.post(
            "/api/v1/recipes/",
            json=recipe_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response1.status_code == 200
        user1_recipe = response1.json()
        
        # Second user should not be able to access first user's recipe
        response = client.get(
            f"/api/v1/recipes/{user1_recipe['id']}",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 403
        assert "Not enough permissions" in response.json()["detail"]
        
        # First user should be able to access their own recipe
        response = client.get(
            f"/api/v1/recipes/{user1_recipe['id']}",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200

    def test_recipes_user_isolation(self, client: TestClient, test_user_token: str, session_fixture: Session):
        """Test that users can only see their own recipes in list endpoint"""
        # Create a second user
        from app.crud.crud_user import user as crud_user
        from app.schemas.user import UserCreate
        
        user2_data = UserCreate(
            email="user2@example.com",
            username="testuser2",
            password="testpassword456"
        )
        user2 = crud_user.create(session_fixture, obj_in=user2_data)
        
        # Login as second user
        login_response = client.post(
            "/api/v1/auth/login",
            json={"email": "user2@example.com", "password": "testpassword456"}
        )
        assert login_response.status_code == 200
        user2_token = login_response.json()["access_token"]
        
        # Create recipe for first user
        response1 = client.post(
            "/api/v1/recipes/",
            json={"recipe_name": "User1 Recipe", "instructions": "User1 instructions", "ingredients": []},
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response1.status_code == 200
        
        # Create recipe for second user
        response2 = client.post(
            "/api/v1/recipes/",
            json={"recipe_name": "User2 Recipe", "instructions": "User2 instructions", "ingredients": []},
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response2.status_code == 200
        
        # First user should only see their own recipe
        response1_get = client.get(
            "/api/v1/recipes/",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response1_get.status_code == 200
        user1_recipes = response1_get.json()
        assert len(user1_recipes) == 1
        assert user1_recipes[0]["recipe_name"] == "User1 Recipe"
        
        # Second user should only see their own recipe
        response2_get = client.get(
            "/api/v1/recipes/",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response2_get.status_code == 200
        user2_recipes = response2_get.json()
        assert len(user2_recipes) == 1
        assert user2_recipes[0]["recipe_name"] == "User2 Recipe"

    def test_create_recipe_invalid_data_types(self, client: TestClient, test_user_token: str):
        """Test creating recipe with invalid data types"""
        # Invalid calories (string instead of int)
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": "Test",
                "instructions": "Test",
                "estimated_calories": "invalid",
                "ingredients": []
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422
        
        # Invalid preparation time (string instead of int)
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": "Test",
                "instructions": "Test",
                "preparation_time_minutes": "invalid",
                "ingredients": []
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422

    def test_create_recipe_invalid_ingredients(self, client: TestClient, test_user_token: str):
        """Test creating recipe with invalid ingredient data"""
        # Missing required ingredient fields
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": "Test Recipe",
                "instructions": "Test instructions",
                "ingredients": [
                    {
                        "ingredient_name": "Test",
                        # Missing required_quantity and required_unit
                    }
                ]
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422
        
        # Invalid quantity type
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": "Test Recipe",
                "instructions": "Test instructions",
                "ingredients": [
                    {
                        "ingredient_name": "Test",
                        "required_quantity": "invalid",
                        "required_unit": "piece"
                    }
                ]
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 422

    def test_create_recipe_edge_cases(self, client: TestClient, test_user_token: str):
        """Test creating recipes with edge case values"""
        # Zero calories
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": "Zero Calorie Recipe",
                "instructions": "Magic recipe",
                "estimated_calories": 0,
                "ingredients": []
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        # Zero preparation time
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": "Instant Recipe",
                "instructions": "No prep needed",
                "preparation_time_minutes": 0,
                "ingredients": []
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert response.status_code == 200
        
        # Very long recipe name
        long_name = "A" * 1000
        response = client.post(
            "/api/v1/recipes/",
            json={
                "recipe_name": long_name,
                "instructions": "Long name recipe",
                "ingredients": []
            },
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        # This should either succeed or fail with appropriate validation
        assert response.status_code in [200, 422]

    def test_get_recipe_with_complex_ingredients(self, client: TestClient, test_user_token: str):
        """Test getting recipe with multiple ingredients"""
        recipe_data = {
            "recipe_name": "Complex Recipe",
            "instructions": "Many steps",
            "ingredients": [
                {"ingredient_name": "Flour", "required_quantity": 2.5, "required_unit": "cups"},
                {"ingredient_name": "Sugar", "required_quantity": 1.0, "required_unit": "cup"},
                {"ingredient_name": "Eggs", "required_quantity": 3.0, "required_unit": "pieces"},
                {"ingredient_name": "Butter", "required_quantity": 0.5, "required_unit": "cup"},
                {"ingredient_name": "Vanilla", "required_quantity": 1.0, "required_unit": "teaspoon"}
            ]
        }
        
        create_response = client.post(
            "/api/v1/recipes/",
            json=recipe_data,
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        assert create_response.status_code == 200
        created_recipe = create_response.json()
        
        # Get the recipe and verify all ingredients are present
        response = client.get(
            f"/api/v1/recipes/{created_recipe['id']}",
            headers={"Authorization": f"Bearer {test_user_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["ingredients"]) == 5
        
        ingredient_names = [ing["ingredient_name"] for ing in data["ingredients"]]
        assert "Flour" in ingredient_names
        assert "Sugar" in ingredient_names
        assert "Eggs" in ingredient_names
        assert "Butter" in ingredient_names
        assert "Vanilla" in ingredient_names