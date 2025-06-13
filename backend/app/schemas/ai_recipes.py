from typing import List, Optional
from pydantic import BaseModel, Field

class CustomRecipeRequest(BaseModel):
    pantry_item_ids: List[int] = Field(..., description="List of pantry item IDs to use in the recipe")
    max_calories: Optional[int] = Field(None, description="Maximum calories for the recipe")
    preparation_time_limit: Optional[int] = Field(None, description="Maximum preparation time in minutes")
    dietary_restrictions: Optional[str] = Field(None, description="Dietary restrictions (e.g., vegetarian, vegan, gluten-free)")
    cuisine_preference: Optional[str] = Field(None, description="Preferred cuisine type")
    additional_notes: Optional[str] = Field(None, description="Additional notes or preferences")

class GeneratedRecipeIngredient(BaseModel):
    name: str
    quantity: float
    unit: str

class GeneratedRecipe(BaseModel):
    recipe_name: str
    instructions: str
    estimated_calories: Optional[int]
    preparation_time_minutes: Optional[int]
    ingredients: List[GeneratedRecipeIngredient]

class UsedPantryItem(BaseModel):
    pantry_item_id: int
    item_name: str
    quantity_used: float
    unit: str

class GenerationMetadata(BaseModel):
    model_used: str
    generation_time: float
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None

class CustomRecipeResponse(BaseModel):
    generated_recipe: GeneratedRecipe
    used_pantry_items: List[UsedPantryItem]
    generation_metadata: GenerationMetadata
    generation_id: Optional[str] = Field(None, description="Unique ID for this generation session")
