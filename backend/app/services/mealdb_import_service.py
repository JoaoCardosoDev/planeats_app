import logging
from typing import Optional, Tuple
from sqlmodel import Session
import re # For parsing measure strings

from app.services.mealdb_service import MealDBService, MealDBMeal
from app.models.recipe_models import RecipeCreate, RecipeIngredientCreate
from app.crud.crud_recipe import recipe as crud_recipe
from app.models.user_models import User

logger = logging.getLogger(__name__)

class MealDBImportService:
    """Service for importing MealDB recipes into user's personal collection"""
    
    def __init__(self):
        self.mealdb_service = MealDBService()
    
    async def close(self):
        """Close the HTTP client"""
        await self.mealdb_service.close()

    def _parse_measure(self, measure_str: Optional[str]) -> Tuple[float, str]:
        """
        Parse a MealDB measure string into a quantity and unit.
        Examples: "1 cup" -> (1.0, "cup"), "1/2 tsp" -> (0.5, "tsp"), 
                  "Pinch" -> (1.0, "Pinch"), "600g" -> (600.0, "g")
        """
        if not measure_str or not measure_str.strip():
            return 1.0, "unit"

        original_measure_str = measure_str.strip()
        
        # Regex to find leading numbers, fractions, or number-unit combinations
        # Handles: "1", "1.5", "1/2", "1 1/2", "1-2", "1kg", "1 kg"
        # It will try to match a number (potentially with fraction or range)
        # and then the rest as unit.
        match = re.match(r"^\s*([\d\./\s-]+)\s*(.*)", original_measure_str)

        quantity = 1.0
        unit = original_measure_str # Default unit is the whole string if no parseable quantity

        if match:
            quantity_part_str = match.group(1).strip()
            unit_part_str = match.group(2).strip()

            # Try to evaluate quantity_part_str
            try:
                if "/" in quantity_part_str and " " in quantity_part_str: # e.g. "1 1/2"
                    whole, frac = quantity_part_str.split(" ", 1)
                    num, den = map(float, frac.split("/"))
                    if den == 0: raise ValueError("Division by zero in fraction")
                    quantity = float(whole) + (num / den)
                elif "/" in quantity_part_str: # e.g. "1/2"
                    num, den = map(float, quantity_part_str.split("/"))
                    if den == 0: raise ValueError("Division by zero in fraction")
                    quantity = num / den
                elif "-" in quantity_part_str: # e.g. "1-2", take the first number
                    quantity = float(quantity_part_str.split("-")[0].strip())
                else: # e.g. "1", "1.5"
                    quantity = float(quantity_part_str)
                
                # If quantity was successfully parsed, the rest is the unit
                unit = unit_part_str if unit_part_str else "unit" # Default to "unit" if unit_part_str is empty
                
                # Special case: if unit_part_str is empty, but quantity_part_str had trailing letters (e.g. "600g")
                if not unit_part_str and quantity_part_str[-1].isalpha():
                    # Try to separate number and unit from quantity_part_str itself
                    val_match = re.match(r"([\d\.]+)([a-zA-Z]+.*)", quantity_part_str)
                    if val_match:
                        quantity = float(val_match.group(1))
                        unit = val_match.group(2)


            except ValueError:
                # Failed to parse quantity_part_str as a number,
                # so the original_measure_str is likely a descriptive unit like "Pinch".
                # Quantity remains 1.0, unit is original_measure_str.
                quantity = 1.0
                unit = original_measure_str
        else:
            # No leading number pattern found, assume descriptive unit.
            quantity = 1.0
            unit = original_measure_str
            
        if not unit.strip(): # Final check if unit became empty
            unit = "unit"
            
        return quantity, unit

    def _estimate_calories(self, meal: MealDBMeal) -> Optional[int]:
        """
        Estimate calories based on meal category and ingredients count
        This is a rough estimation since MealDB doesn't provide calorie data
        """
        try:
            # Base calories by category
            category_calories = {
                "Beef": 400,
                "Chicken": 300,
                "Dessert": 500,
                "Lamb": 450,
                "Miscellaneous": 250,
                "Pasta": 350,
                "Pork": 400,
                "Seafood": 250,
                "Side": 150,
                "Starter": 200,
                "Vegan": 200,
                "Vegetarian": 250,
                "Breakfast": 300,
                "Goat": 400,
                "Turkey": 300,
            }
            
            base_calories = category_calories.get(meal.category, 300)
            
            # Adjust based on ingredient count (more ingredients usually = more calories)
            ingredient_multiplier = 1 + (len(meal.ingredients) - 5) * 0.1
            ingredient_multiplier = max(0.7, min(ingredient_multiplier, 2.0))  # Cap between 0.7 and 2.0
            
            estimated_calories = int(base_calories * ingredient_multiplier)
            
            return estimated_calories
        except Exception as e:
            logger.warning(f"Error estimating calories for meal {meal.name}: {e}")
            return None
    
    def _estimate_prep_time(self, meal: MealDBMeal) -> Optional[int]:
        """
        Estimate preparation time based on instructions length and complexity
        """
        try:
            if not meal.instructions:
                return None
            
            # Base time by category
            category_time = {
                "Dessert": 60,
                "Beef": 90,
                "Lamb": 90,
                "Pork": 75,
                "Chicken": 45,
                "Turkey": 60,
                "Seafood": 30,
                "Pasta": 30,
                "Side": 20,
                "Starter": 25,
                "Breakfast": 15,
                "Vegan": 35,
                "Vegetarian": 35,
                "Miscellaneous": 40,
                "Goat": 90,
            }
            
            base_time = category_time.get(meal.category, 40)
            
            # Adjust based on instruction length
            instruction_words = len(meal.instructions.split())
            if instruction_words > 200:
                time_multiplier = 1.5
            elif instruction_words > 100:
                time_multiplier = 1.2
            elif instruction_words < 50:
                time_multiplier = 0.8
            else:
                time_multiplier = 1.0
            
            # Adjust based on ingredient count
            ingredient_count = len(meal.ingredients)
            if ingredient_count > 15:
                time_multiplier *= 1.3
            elif ingredient_count > 10:
                time_multiplier *= 1.1
            elif ingredient_count < 5:
                time_multiplier *= 0.9
            
            estimated_time = int(base_time * time_multiplier)
            
            return estimated_time
        except Exception as e:
            logger.warning(f"Error estimating prep time for meal {meal.name}: {e}")
            return None
    
    def _convert_mealdb_to_recipe_create(self, meal: MealDBMeal) -> RecipeCreate:
        """Convert MealDB meal to RecipeCreate format"""
        try:
            # Convert ingredients
            ingredients = []
            for mealdb_ingredient in meal.ingredients:
                quantity, unit = self._parse_measure(mealdb_ingredient.measure)
                ingredients.append(RecipeIngredientCreate(
                    ingredient_name=mealdb_ingredient.name,
                    required_quantity=quantity,
                    required_unit=unit
                ))
            
            # Enhance instructions with additional info if available
            enhanced_instructions = meal.instructions
            
            if meal.youtube_url:
                enhanced_instructions += f"\n\nVideo tutorial: {meal.youtube_url}"
            
            if meal.source_url:
                enhanced_instructions += f"\nOriginal recipe: {meal.source_url}"
            
            if meal.tags:
                enhanced_instructions += f"\nTags: {meal.tags}"
            
            if meal.area:
                enhanced_instructions += f"\nCuisine: {meal.area}"
            
            # Add attribution
            enhanced_instructions += f"\n\nRecipe imported from The Meal DB (ID: {meal.id})"
            
            return RecipeCreate(
                recipe_name=meal.name,
                instructions=enhanced_instructions,
                estimated_calories=self._estimate_calories(meal),
                preparation_time_minutes=self._estimate_prep_time(meal),
                image_url=meal.image_url,
                ingredients=ingredients
            )
        except Exception as e:
            logger.error(f"Error converting MealDB meal to RecipeCreate: {e}")
            raise ValueError(f"Failed to convert meal data: {e}")
    
    async def import_meal_by_id(
        self, 
        db: Session, 
        meal_id: str, 
        user: User
    ) -> Optional[dict]:
        """
        Import a specific MealDB meal into user's recipe collection
        
        Returns dict with import result or None if failed
        """
        try:
            # Fetch meal from MealDB
            meal = await self.mealdb_service.get_meal_by_id(meal_id)
            
            if not meal:
                return {
                    "success": False,
                    "error": f"Meal with ID {meal_id} not found in MealDB"
                }
            
            # Convert to RecipeCreate format
            recipe_create = self._convert_mealdb_to_recipe_create(meal)
            
            # Check if user already has this recipe (by name)
            existing_recipes = crud_recipe.get_multi_with_filters(
                db=db,
                user_id=user.id,
                skip=0,
                limit=1,
                user_created_only=True
            )
            
            for existing_recipe in existing_recipes:
                if existing_recipe.recipe_name.lower() == meal.name.lower():
                    return {
                        "success": False,
                        "error": f"Recipe '{meal.name}' already exists in your collection"
                    }
            
            # Create the recipe
            created_recipe = crud_recipe.create_with_user(
                db=db,
                obj_in=recipe_create,
                user_id=user.id
            )
            
            logger.info(f"Successfully imported MealDB recipe {meal_id} for user {user.id}")
            
            return {
                "success": True,
                "recipe_id": created_recipe.id,
                "recipe_name": created_recipe.recipe_name,
                "mealdb_id": meal_id,
                "estimated_calories": created_recipe.estimated_calories,
                "estimated_prep_time": created_recipe.preparation_time_minutes,
                "ingredients_count": len(created_recipe.ingredients)
            }
            
        except Exception as e:
            logger.error(f"Error importing MealDB meal {meal_id}: {e}")
            return {
                "success": False,
                "error": f"Failed to import recipe: {str(e)}"
            }
    
    async def import_random_meal(
        self, 
        db: Session, 
        user: User
    ) -> Optional[dict]:
        """
        Import a random MealDB meal into user's recipe collection
        """
        try:
            # Get random meal from MealDB
            meal = await self.mealdb_service.get_random_meal()
            
            if not meal:
                return {
                    "success": False,
                    "error": "No random meal found in MealDB"
                }
            
            # Import the meal
            return await self.import_meal_by_id(db, meal.id, user)
            
        except Exception as e:
            logger.error(f"Error importing random MealDB meal: {e}")
            return {
                "success": False,
                "error": f"Failed to import random recipe: {str(e)}"
            }
    
    async def suggest_recipes_by_pantry_ingredients(
        self,
        db: Session,
        user_ingredients: list[str],
        limit: int = 10
    ) -> list[MealDBMeal]:
        """
        Suggest MealDB recipes based on pantry ingredients
        
        This searches for recipes that contain any of the user's pantry ingredients
        """
        try:
            all_suggested_meals = []
            seen_meal_ids = set()
            
            # Search for recipes containing each pantry ingredient
            for ingredient in user_ingredients[:5]:  # Limit to first 5 ingredients to avoid too many API calls
                try:
                    meals = await self.mealdb_service.filter_by_ingredient(ingredient)
                    
                    for meal in meals:
                        if meal.id not in seen_meal_ids:
                            all_suggested_meals.append(meal)
                            seen_meal_ids.add(meal.id)
                            
                            if len(all_suggested_meals) >= limit:
                                break
                    
                    if len(all_suggested_meals) >= limit:
                        break
                        
                except Exception as e:
                    logger.warning(f"Error searching for ingredient '{ingredient}': {e}")
                    continue
            
            return all_suggested_meals[:limit]
            
        except Exception as e:
            logger.error(f"Error suggesting recipes by pantry ingredients: {e}")
            return []

# Global instance for dependency injection
mealdb_import_service = MealDBImportService()
