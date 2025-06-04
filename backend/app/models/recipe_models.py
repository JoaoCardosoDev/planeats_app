from sqlmodel import Field, SQLModel, Relationship, Column, JSON
from typing import Optional, List
from datetime import datetime

# Forward declaration for relationship
class User(SQLModel):
    pass

class RecipeIngredientBase(SQLModel):
    ingredient_name: str
    required_quantity: float
    required_unit: str

class RecipeIngredient(RecipeIngredientBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    recipe_id: int = Field(foreign_key="recipe.id")
    
    recipe: Optional["Recipe"] = Relationship(back_populates="ingredients")

class RecipeIngredientCreate(RecipeIngredientBase):
    pass

class RecipeIngredientRead(RecipeIngredientBase):
    id: int

class RecipeBase(SQLModel):
    recipe_name: str
    instructions: str
    estimated_calories: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    image_url: Optional[str] = None
    
    # New fields for preference-based recommendations
    dietary_tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))  # ["vegetarian", "gluten_free", etc.]
    cuisine_type: Optional[str] = None  # "portuguese", "italian", "asian", etc.
    difficulty_level: Optional[str] = None  # "easy", "medium", "hard"
    
    # Additional metadata for better recommendations
    is_healthy: Optional[bool] = False
    is_comfort_food: Optional[bool] = False
    serving_size: Optional[int] = 4  # Default serving size

class Recipe(RecipeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_by_user_id: Optional[int] = Field(default=None, foreign_key="user.id") # Nullable for system recipes
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to User (creator) - Optional
    creator: Optional["User"] = Relationship() # Define back_populates in User model if needed
    
    # Relationship to RecipeIngredients
    ingredients: List["RecipeIngredient"] = Relationship(back_populates="recipe")

class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientCreate] = []

class RecipeRead(RecipeBase):
    id: int
    created_by_user_id: Optional[int]
    created_at: datetime
    ingredients: List[RecipeIngredientRead] = []

class RecipeUpdate(SQLModel):
    recipe_name: Optional[str] = None
    instructions: Optional[str] = None
    estimated_calories: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    image_url: Optional[str] = None
    dietary_tags: Optional[List[str]] = None
    cuisine_type: Optional[str] = None
    difficulty_level: Optional[str] = None
    is_healthy: Optional[bool] = None
    is_comfort_food: Optional[bool] = None
    serving_size: Optional[int] = None
    ingredients: Optional[List[RecipeIngredientCreate]] = None
