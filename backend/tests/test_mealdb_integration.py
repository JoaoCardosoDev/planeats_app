import pytest
import httpx
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.main import app
from app.services.mealdb_service import MealDBService, MealDBMeal, MealDBIngredient
from app.services.mealdb_import_service import MealDBImportService

client = TestClient(app)

class TestMealDBService:
    """Test the MealDB service functionality"""
    
    @pytest.fixture
    def mealdb_service(self):
        return MealDBService()
    
    @pytest.fixture
    def sample_mealdb_response(self):
        """Sample response from MealDB API"""
        return {
            "meals": [
                {
                    "idMeal": "52772",
                    "strMeal": "Teriyaki Chicken Casserole",
                    "strCategory": "Chicken",
                    "strArea": "Japanese",
                    "strInstructions": "Preheat oven to 180C/160C Fan/Gas 4...",
                    "strMealThumb": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
                    "strIngredient1": "soy sauce",
                    "strIngredient2": "water",
                    "strIngredient3": "brown sugar",
                    "strIngredient4": "ground ginger",
                    "strIngredient5": "minced garlic",
                    "strIngredient6": "cornstarch",
                    "strIngredient7": "chicken breasts",
                    "strIngredient8": "stir-fry vegetables",
                    "strIngredient9": "brown rice",
                    "strMeasure1": "3/4 cup",
                    "strMeasure2": "1/2 cup",
                    "strMeasure3": "1/4 cup",
                    "strMeasure4": "1/2 teaspoon",
                    "strMeasure5": "1/2 teaspoon",
                    "strMeasure6": "4 Tablespoons",
                    "strMeasure7": "2",
                    "strMeasure8": "1 (12 oz.)",
                    "strMeasure9": "3 cups",
                    "strYoutube": "https://www.youtube.com/watch?v=4aZr5hZXP_s",
                    "strSource": "https://www.example.com/recipe"
                }
            ]
        }
    
    def test_parse_meal(self, mealdb_service, sample_mealdb_response):
        """Test parsing MealDB API response into MealDBMeal object"""
        meal_data = sample_mealdb_response["meals"][0]
        meal = mealdb_service._parse_meal(meal_data)
        
        assert isinstance(meal, MealDBMeal)
        assert meal.id == "52772"
        assert meal.name == "Teriyaki Chicken Casserole"
        assert meal.category == "Chicken"
        assert meal.area == "Japanese"
        assert meal.youtube_url == "https://www.youtube.com/watch?v=4aZr5hZXP_s"
        assert meal.source_url == "https://www.example.com/recipe"
        
        # Test ingredients parsing
        assert len(meal.ingredients) == 9
        assert meal.ingredients[0].name == "soy sauce"
        assert meal.ingredients[0].measure == "3/4 cup"
        assert meal.ingredients[6].name == "chicken breasts"
        assert meal.ingredients[6].measure == "2"
    
    @pytest.mark.asyncio
    async def test_search_meals_by_name(self, mealdb_service, sample_mealdb_response):
        """Test searching meals by name"""
        with patch.object(mealdb_service.client, 'get') as mock_get:
            mock_response = AsyncMock()
            mock_response.json.return_value = sample_mealdb_response
            mock_response.raise_for_status.return_value = None
            mock_get.return_value = mock_response
            
            meals = await mealdb_service.search_meals_by_name("Teriyaki")
            
            assert len(meals) == 1
            assert meals[0].name == "Teriyaki Chicken Casserole"
            mock_get.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_meal_by_id(self, mealdb_service, sample_mealdb_response):
        """Test getting meal by ID"""
        with patch.object(mealdb_service.client, 'get') as mock_get:
            mock_response = AsyncMock()
            mock_response.json.return_value = sample_mealdb_response
            mock_response.raise_for_status.return_value = None
            mock_get.return_value = mock_response
            
            meal = await mealdb_service.get_meal_by_id("52772")
            
            assert meal is not None
            assert meal.id == "52772"
            assert meal.name == "Teriyaki Chicken Casserole"
    
    @pytest.mark.asyncio
    async def test_get_random_meal(self, mealdb_service, sample_mealdb_response):
        """Test getting random meal"""
        with patch.object(mealdb_service.client, 'get') as mock_get:
            mock_response = AsyncMock()
            mock_response.json.return_value = sample_mealdb_response
            mock_response.raise_for_status.return_value = None
            mock_get.return_value = mock_response
            
            meal = await mealdb_service.get_random_meal()
            
            assert meal is not None
            assert meal.id == "52772"
    
    @pytest.mark.asyncio
    async def test_search_error_handling(self, mealdb_service):
        """Test error handling in search methods"""
        with patch.object(mealdb_service.client, 'get') as mock_get:
            mock_get.side_effect = httpx.RequestError("Network error")
            
            meals = await mealdb_service.search_meals_by_name("test")
            assert meals == []
    
    @pytest.mark.asyncio
    async def test_no_results_handling(self, mealdb_service):
        """Test handling when no meals are found"""
        with patch.object(mealdb_service.client, 'get') as mock_get:
            mock_response = AsyncMock()
            mock_response.json.return_value = {"meals": None}
            mock_response.raise_for_status.return_value = None
            mock_get.return_value = mock_response
            
            meals = await mealdb_service.search_meals_by_name("nonexistent")
            assert meals == []
    
    def test_get_ingredient_image_url(self, mealdb_service):
        """Test ingredient image URL generation"""
        url = mealdb_service.get_ingredient_image_url("chicken breast", "medium")
        expected = "https://www.themealdb.com/images/ingredients/chicken_breast-medium.png"
        assert url == expected
        
        url_small = mealdb_service.get_ingredient_image_url("tomato", "small")
        expected_small = "https://www.themealdb.com/images/ingredients/tomato-small.png"
        assert url_small == expected_small
    
    def test_get_meal_thumbnail_url(self, mealdb_service):
        """Test meal thumbnail URL generation"""
        original_url = "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg"
        
        thumbnail = mealdb_service.get_meal_thumbnail_url(original_url, "medium")
        expected = "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg/medium"
        assert thumbnail == expected

class TestMealDBImportService:
    """Test the MealDB import service functionality"""
    
    @pytest.fixture
    def import_service(self):
        return MealDBImportService()
    
    @pytest.fixture
    def sample_meal(self):
        """Sample MealDBMeal object"""
        return MealDBMeal(
            id="52772",
            name="Teriyaki Chicken Casserole",
            category="Chicken",
            area="Japanese",
            instructions="Preheat oven to 180C/160C Fan/Gas 4...",
            image_url="https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
            ingredients=[
                MealDBIngredient(name="soy sauce", measure="3/4 cup"),
                MealDBIngredient(name="chicken breasts", measure="2"),
                MealDBIngredient(name="brown rice", measure="3 cups")
            ],
            youtube_url="https://www.youtube.com/watch?v=4aZr5hZXP_s",
            source_url="https://www.example.com/recipe"
        )
    
    def test_estimate_calories(self, import_service, sample_meal):
        """Test calorie estimation"""
        calories = import_service._estimate_calories(sample_meal)
        
        assert calories is not None
        assert isinstance(calories, int)
        assert 200 < calories < 800  # Reasonable range for chicken dish
    
    def test_estimate_prep_time(self, import_service, sample_meal):
        """Test preparation time estimation"""
        prep_time = import_service._estimate_prep_time(sample_meal)
        
        assert prep_time is not None
        assert isinstance(prep_time, int)
        assert 15 < prep_time < 120  # Reasonable range in minutes
    
    def test_convert_mealdb_to_recipe_create(self, import_service, sample_meal):
        """Test conversion from MealDBMeal to RecipeCreate"""
        recipe_create = import_service._convert_mealdb_to_recipe_create(sample_meal)
        
        assert recipe_create.recipe_name == "Teriyaki Chicken Casserole"
        assert len(recipe_create.ingredients) == 3
        assert recipe_create.estimated_calories is not None
        assert recipe_create.preparation_time_minutes is not None
        assert recipe_create.image_url == sample_meal.image_url
        
        # Check that additional info is added to instructions
        assert "Video tutorial: https://www.youtube.com/watch?v=4aZr5hZXP_s" in recipe_create.instructions
        assert "Original recipe: https://www.example.com/recipe" in recipe_create.instructions
        assert "Cuisine: Japanese" in recipe_create.instructions
        assert "Recipe imported from The Meal DB (ID: 52772)" in recipe_create.instructions

class TestMealDBAPIEndpoints:
    """Test the MealDB API endpoints"""
    
    def test_test_connection_endpoint(self):
        """Test the connection test endpoint"""
        with patch('app.services.mealdb_service.mealdb_service.get_random_meal') as mock_get:
            mock_meal = MealDBMeal(
                id="52772",
                name="Test Meal",
                category="Test",
                area="Test Area",
                instructions="Test instructions",
                ingredients=[]
            )
            mock_get.return_value = mock_meal
            
            response = client.get("/api/v1/mealdb/test-connection")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "test_meal" in data
            assert data["test_meal"]["name"] == "Test Meal"
    
    def test_search_meals_endpoint(self):
        """Test the search meals endpoint"""
        with patch('app.services.mealdb_service.mealdb_service.search_meals_by_name') as mock_search:
            mock_meal = MealDBMeal(
                id="52772",
                name="Arrabiata",
                category="Pasta",
                area="Italian",
                instructions="Test instructions",
                ingredients=[]
            )
            mock_search.return_value = [mock_meal]
            
            response = client.get("/api/v1/mealdb/search?name=Arrabiata")
            
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 1
            assert len(data["meals"]) == 1
            assert data["meals"][0]["name"] == "Arrabiata"
    
    def test_search_meals_validation(self):
        """Test search endpoint validation"""
        # Test no parameters
        response = client.get("/api/v1/mealdb/search")
        assert response.status_code == 400
        
        # Test multiple parameters
        response = client.get("/api/v1/mealdb/search?name=test&category=beef")
        assert response.status_code == 400
        
        # Test invalid letter
        response = client.get("/api/v1/mealdb/search?letter=ab")
        assert response.status_code == 400
    
    def test_get_meal_endpoint(self):
        """Test the get meal by ID endpoint"""
        with patch('app.services.mealdb_service.mealdb_service.get_meal_by_id') as mock_get:
            mock_meal = MealDBMeal(
                id="52772",
                name="Test Meal",
                category="Test",
                area="Test Area",
                instructions="Test instructions",
                ingredients=[]
            )
            mock_get.return_value = mock_meal
            
            response = client.get("/api/v1/mealdb/meal/52772")
            
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Test Meal"
            assert data["id"] == "52772"
    
    def test_get_meal_not_found(self):
        """Test get meal endpoint when meal is not found"""
        with patch('app.services.mealdb_service.mealdb_service.get_meal_by_id') as mock_get:
            mock_get.return_value = None
            
            response = client.get("/api/v1/mealdb/meal/99999")
            
            assert response.status_code == 404
    
    def test_get_categories_endpoint(self):
        """Test the get categories endpoint"""
        with patch('app.services.mealdb_service.mealdb_service.get_categories') as mock_categories:
            from app.services.mealdb_service import MealDBCategory
            
            mock_categories.return_value = [
                MealDBCategory(id="1", name="Beef", description="Beef dishes", image_url="test.jpg"),
                MealDBCategory(id="2", name="Chicken", description="Chicken dishes", image_url="test2.jpg")
            ]
            
            response = client.get("/api/v1/mealdb/categories")
            
            assert response.status_code == 200
            data = response.json()
            assert data["total"] == 2
            assert len(data["categories"]) == 2
            assert data["categories"][0]["name"] == "Beef"
    
    def test_ingredient_image_url_endpoint(self):
        """Test the ingredient image URL endpoint"""
        response = client.get("/api/v1/mealdb/ingredient-image/chicken?size=medium")
        
        assert response.status_code == 200
        data = response.json()
        assert data["ingredient_name"] == "chicken"
        assert data["size"] == "medium"
        assert "chicken-medium.png" in data["image_url"]
    
    def test_ingredient_image_url_validation(self):
        """Test ingredient image URL endpoint validation"""
        response = client.get("/api/v1/mealdb/ingredient-image/chicken?size=invalid")
        assert response.status_code == 400

class TestMealDBIntegration:
    """Integration tests for the complete MealDB functionality"""
    
    @pytest.mark.asyncio
    async def test_full_meal_import_flow(self):
        """Test the complete flow of importing a meal"""
        # This would require a mock database session and user
        # Implementation depends on your test database setup
        pass
    
    def test_api_documentation_generation(self):
        """Test that MealDB endpoints are properly documented"""
        response = client.get("/docs")
        assert response.status_code == 200
        
        # Check that our endpoints appear in the OpenAPI spec
        response = client.get("/openapi.json")
        assert response.status_code == 200
        
        openapi_spec = response.json()
        paths = openapi_spec.get("paths", {})
        
        # Check that MealDB endpoints are documented
        assert "/api/v1/mealdb/search" in paths
        assert "/api/v1/mealdb/meal/{meal_id}" in paths
        assert "/api/v1/mealdb/random" in paths
        assert "/api/v1/mealdb/categories" in paths
        assert "/api/v1/mealdb/test-connection" in paths

# Additional fixtures and utilities for testing
@pytest.fixture
def mock_mealdb_api_responses():
    """Fixture providing various mock API responses"""
    return {
        "search_response": {
            "meals": [
                {
                    "idMeal": "52772",
                    "strMeal": "Teriyaki Chicken Casserole",
                    "strCategory": "Chicken",
                    "strArea": "Japanese",
                    "strInstructions": "Preheat oven...",
                    "strMealThumb": "https://example.com/image.jpg",
                    "strIngredient1": "chicken",
                    "strMeasure1": "2 pieces"
                }
            ]
        },
        "categories_response": {
            "categories": [
                {
                    "idCategory": "1",
                    "strCategory": "Beef",
                    "strCategoryDescription": "Beef dishes",
                    "strCategoryThumb": "https://example.com/beef.jpg"
                }
            ]
        },
        "areas_response": {
            "meals": [
                {"strArea": "Italian"},
                {"strArea": "Chinese"},
                {"strArea": "Mexican"}
            ]
        }
    }
