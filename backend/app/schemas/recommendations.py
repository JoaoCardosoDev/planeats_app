from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.ai_recipes import GeneratedRecipeIngredient

class MatchingIngredient(BaseModel):
    pantry_item_id: int
    pantry_item_name: str
    recipe_ingredient_name: str
    pantry_quantity: float
    pantry_unit: str
    required_quantity: float
    required_unit: str

class MissingIngredient(BaseModel):
    ingredient_name: str
    required_quantity: float
    required_unit: str

class ExpiringIngredient(BaseModel):
    pantry_item_id: int
    pantry_item_name: str
    expiration_date: str
    days_until_expiration: int

class RecommendedRecipe(BaseModel):
    recipe_id: int
    recipe_name: str
    estimated_calories: Optional[int]
    preparation_time_minutes: Optional[int]
    image_url: Optional[str]
    instructions: str
    matching_ingredients: List[MatchingIngredient]
    missing_ingredients: List[MissingIngredient]
    match_score: float = Field(..., description="Score from 0-1 indicating how well pantry items match recipe")
    expiring_ingredients_used: List[ExpiringIngredient]

class RecipeRecommendationsResponse(BaseModel):
    recommendations: List[RecommendedRecipe]
    total_pantry_items: int
    total_recipes_analyzed: int
    message: Optional[str] = Field(None, description="Informative message if no recommendations found")
