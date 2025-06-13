import httpx
import logging
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
from datetime import datetime
import asyncio # Added for sleep in retry logic

logger = logging.getLogger(__name__)

class MealDBIngredient(BaseModel):
    """Represents an ingredient from MealDB API"""
    name: str
    measure: str

class MealDBMeal(BaseModel):
    """Represents a meal from MealDB API"""
    id: str
    name: str
    category: Optional[str] = None
    area: Optional[str] = None
    instructions: str
    image_url: Optional[str] = None
    ingredients: List[MealDBIngredient] = []
    youtube_url: Optional[str] = None
    source_url: Optional[str] = None
    tags: Optional[str] = None

class MealDBCategory(BaseModel):
    """Represents a category from MealDB API"""
    id: str
    name: str
    description: str
    image_url: str

class MealDBArea(BaseModel):
    """Represents an area/cuisine from MealDB API"""
    name: str

class MealDBIngredientInfo(BaseModel):
    """Represents ingredient information from MealDB API"""
    name: str
    description: Optional[str] = None
    type: Optional[str] = None

class MealDBService:
    """Service for interacting with The Meal DB API"""
    
    BASE_URL = "https://www.themealdb.com/api/json/v1/1"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    def _parse_meal(self, meal_data: Dict[str, Any]) -> MealDBMeal:
        """Parse meal data from MealDB API response"""
        try:
            # Extract ingredients (MealDB uses strIngredient1-20 and strMeasure1-20)
            ingredients = []
            for i in range(1, 21):
                ingredient_key = f"strIngredient{i}"
                measure_key = f"strMeasure{i}"
                
                ingredient = meal_data.get(ingredient_key, "").strip()
                measure = meal_data.get(measure_key, "").strip()
                
                if ingredient:
                    ingredients.append(MealDBIngredient(
                        name=ingredient,
                        measure=measure or "To taste"
                    ))
            
            return MealDBMeal(
                id=meal_data["idMeal"],
                name=meal_data["strMeal"],
                category=meal_data.get("strCategory"),
                area=meal_data.get("strArea"),
                instructions=meal_data.get("strInstructions", ""),
                image_url=meal_data.get("strMealThumb"),
                ingredients=ingredients,
                youtube_url=meal_data.get("strYoutube"),
                source_url=meal_data.get("strSource"),
                tags=meal_data.get("strTags")
            )
        except Exception as e:
            logger.error(f"Error parsing meal data: {e}")
            raise ValueError(f"Invalid meal data structure: {e}")
    
    async def search_meals_by_name(self, name: str) -> List[MealDBMeal]:
        """Search meals by name"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/search.php", params={"s": name})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            return [self._parse_meal(meal) for meal in data["meals"]]
        except httpx.RequestError as e:
            logger.error(f"Error searching meals by name '{name}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error searching meals by name '{name}': {e}")
            return []
    
    async def search_meals_by_first_letter(self, letter: str) -> List[MealDBMeal]:
        """List all meals by first letter"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/search.php", params={"f": letter.lower()})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            return [self._parse_meal(meal) for meal in data["meals"]]
        except httpx.RequestError as e:
            logger.error(f"Error searching meals by letter '{letter}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error searching meals by letter '{letter}': {e}")
            return []
    
    async def get_meal_by_id(self, meal_id: str) -> Optional[MealDBMeal]:
        """Get full meal details by ID"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/lookup.php", params={"i": meal_id})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals") or not data["meals"]:
                return None
            
            return self._parse_meal(data["meals"][0])
        except httpx.RequestError as e:
            logger.error(f"Error getting meal by ID '{meal_id}': {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting meal by ID '{meal_id}': {e}")
            return None
    
    async def get_random_meal(self, retries: int = 3, delay_seconds: float = 0.5) -> Optional[MealDBMeal]:
        """Get a random meal, with retries."""
        last_exception: Optional[Exception] = None
        for attempt in range(retries):
            try:
                logger.debug(f"Attempt {attempt + 1}/{retries} to get random meal.")
                response = await self.client.get(f"{self.BASE_URL}/random.php")
                response.raise_for_status() # Raises HTTPStatusError for 4xx/5xx responses
                data = response.json()
                
                if data.get("meals") and data["meals"]:
                    return self._parse_meal(data["meals"][0])
                else:
                    # This case (e.g., 200 OK but "meals": null or "meals": []) is a valid failure to find a meal.
                    logger.warn(f"Attempt {attempt + 1}/{retries}: No meal data in successful random meal response from TheMealDB.")
                    last_exception = ValueError("No meal data in TheMealDB response") # Store this as a potential final error
            
            except httpx.HTTPStatusError as e: # Specific HTTP errors like 404, 500 from MealDB
                logger.warn(f"Attempt {attempt + 1}/{retries}: HTTPStatusError getting random meal from TheMealDB: {e.response.status_code} - {e}")
                last_exception = e
            except httpx.RequestError as e: # Network errors, timeouts
                logger.warn(f"Attempt {attempt + 1}/{retries}: RequestError getting random meal from TheMealDB: {e}")
                last_exception = e
            except Exception as e: # Other errors like JSON parsing
                logger.warn(f"Attempt {attempt + 1}/{retries}: Unexpected error processing random meal from TheMealDB: {e}")
                last_exception = e

            if attempt < retries - 1:
                logger.debug(f"Waiting {delay_seconds}s before next attempt.")
                await asyncio.sleep(delay_seconds) # Wait before retrying
        
        logger.error(f"Failed to get random meal after {retries} attempts. Last error: {last_exception}")
        return None # Return None if all retries fail
    
    async def get_categories(self) -> List[MealDBCategory]:
        """Get all meal categories"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/categories.php")
            response.raise_for_status()
            data = response.json()
            
            if not data.get("categories"):
                return []
            
            return [
                MealDBCategory(
                    id=cat["idCategory"],
                    name=cat["strCategory"],
                    description=cat.get("strCategoryDescription", ""),
                    image_url=cat.get("strCategoryThumb", "")
                )
                for cat in data["categories"]
            ]
        except httpx.RequestError as e:
            logger.error(f"Error getting categories: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting categories: {e}")
            return []
    
    async def get_areas(self) -> List[MealDBArea]:
        """Get all meal areas/cuisines"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/list.php", params={"a": "list"})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            return [MealDBArea(name=area["strArea"]) for area in data["meals"]]
        except httpx.RequestError as e:
            logger.error(f"Error getting areas: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting areas: {e}")
            return []
    
    async def get_ingredients_list(self) -> List[MealDBIngredientInfo]:
        """Get all available ingredients"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/list.php", params={"i": "list"})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            return [
                MealDBIngredientInfo(
                    name=ing["strIngredient"],
                    description=ing.get("strDescription"),
                    type=ing.get("strType")
                )
                for ing in data["meals"]
            ]
        except httpx.RequestError as e:
            logger.error(f"Error getting ingredients: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error getting ingredients: {e}")
            return []
    
    async def filter_by_ingredient(self, ingredient: str) -> List[MealDBMeal]:
        """Filter meals by main ingredient"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/filter.php", params={"i": ingredient})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            # Note: filter endpoint returns limited data, need to fetch full details
            meals = []
            for meal in data["meals"]:
                full_meal = await self.get_meal_by_id(meal["idMeal"])
                if full_meal:
                    meals.append(full_meal)
            
            return meals
        except httpx.RequestError as e:
            logger.error(f"Error filtering by ingredient '{ingredient}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error filtering by ingredient '{ingredient}': {e}")
            return []
    
    async def filter_by_category(self, category: str) -> List[MealDBMeal]:
        """Filter meals by category"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/filter.php", params={"c": category})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            # Note: filter endpoint returns limited data, need to fetch full details
            meals = []
            for meal in data["meals"]:
                full_meal = await self.get_meal_by_id(meal["idMeal"])
                if full_meal:
                    meals.append(full_meal)
            
            return meals
        except httpx.RequestError as e:
            logger.error(f"Error filtering by category '{category}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error filtering by category '{category}': {e}")
            return []
    
    async def filter_by_area(self, area: str) -> List[MealDBMeal]:
        """Filter meals by area/cuisine"""
        try:
            response = await self.client.get(f"{self.BASE_URL}/filter.php", params={"a": area})
            response.raise_for_status()
            data = response.json()
            
            if not data.get("meals"):
                return []
            
            # Note: filter endpoint returns limited data, need to fetch full details
            meals = []
            for meal in data["meals"]:
                full_meal = await self.get_meal_by_id(meal["idMeal"])
                if full_meal:
                    meals.append(full_meal)
            
            return meals
        except httpx.RequestError as e:
            logger.error(f"Error filtering by area '{area}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error filtering by area '{area}': {e}")
            return []
    
    @staticmethod
    def get_ingredient_image_url(ingredient_name: str, size: str = "medium") -> str:
        """Get ingredient image URL"""
        # Format ingredient name (replace spaces with underscores, lowercase)
        formatted_name = ingredient_name.lower().replace(" ", "_")
        
        if size == "small":
            return f"https://www.themealdb.com/images/ingredients/{formatted_name}-small.png"
        elif size == "large":
            return f"https://www.themealdb.com/images/ingredients/{formatted_name}-large.png"
        else:  # medium
            return f"https://www.themealdb.com/images/ingredients/{formatted_name}-medium.png"
    
    @staticmethod
    def get_meal_thumbnail_url(image_url: str, size: str = "medium") -> str:
        """Get meal thumbnail URL"""
        if not image_url:
            return ""
        
        if size == "small":
            return f"{image_url}/small"
        elif size == "large":
            return f"{image_url}/large"
        else:  # medium
            return f"{image_url}/medium"

# Global instance for dependency injection
mealdb_service = MealDBService()
