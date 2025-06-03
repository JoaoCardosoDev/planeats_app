from typing import List, Optional, Literal
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

class RecommendationFilters(BaseModel):
    max_preparation_time: Optional[int] = Field(None, description="Maximum preparation time in minutes")
    max_calories: Optional[int] = Field(None, description="Maximum calories per serving")
    max_missing_ingredients: Optional[int] = Field(None, description="Maximum number of missing ingredients allowed")

class RecommendationSort(BaseModel):
    sort_by: Literal["match_score", "preparation_time", "calories", "expiring_ingredients"] = Field(
        "match_score", 
        description="Field to sort by"
    )
    sort_order: Literal["asc", "desc"] = Field(
        "desc", 
        description="Sort order - ascending or descending"
    )

class RecommendationMetadata(BaseModel):
    total_recipes_analyzed: int
    total_before_filters: int
    total_after_filters: int
    applied_filters: RecommendationFilters
    applied_sort: RecommendationSort

class RecipeRecommendationsResponse(BaseModel):
    recommendations: List[RecommendedRecipe]
    total_pantry_items: int
    metadata: RecommendationMetadata
    message: Optional[str] = Field(None, description="Informative message if no recommendations found")

class RecommendationsRequest(BaseModel):
    filters: Optional[RecommendationFilters] = None
    sort: Optional[RecommendationSort] = None
