from sqlmodel import Field, SQLModel, Column, JSON
from typing import Optional, List, Dict, Any
from enum import Enum

class DietaryRestriction(str, Enum):
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    GLUTEN_FREE = "gluten_free"
    LACTOSE_FREE = "lactose_free"
    KETO = "keto"
    PALEO = "paleo"
    MEDITERRANEAN = "mediterranean"

class CuisineType(str, Enum):
    PORTUGUESE = "portuguese"
    ITALIAN = "italian"
    ASIAN = "asian"
    MEXICAN = "mexican"
    HEALTHY = "healthy"
    COMFORT_FOOD = "comfort_food"
    MEDITERRANEAN = "mediterranean"
    INDIAN = "indian"
    FRENCH = "french"
    AMERICAN = "american"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class UserPreferenceBase(SQLModel):
    daily_calorie_goal: Optional[int] = None
    
    # Enhanced dietary restrictions with specific enums
    dietary_restrictions: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Preferred cuisine types
    preferred_cuisines: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Preferred difficulty level
    preferred_difficulty: Optional[str] = None
    
    # Maximum preparation time preference (minutes)
    max_prep_time_preference: Optional[int] = None
    
    # Maximum calories per meal preference
    max_calories_preference: Optional[int] = None
    
    # Whether to exclude recipes with missing ingredients
    avoid_missing_ingredients: Optional[bool] = False
    
    # Whether to prioritize expiring ingredients
    prioritize_expiring_ingredients: Optional[bool] = True
    
    # Other flexible preferences
    other_preferences: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

class UserPreference(UserPreferenceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True) # Ensure one-to-one

class UserPreferenceCreate(UserPreferenceBase):
    pass

class UserPreferenceRead(UserPreferenceBase):
    id: int
    user_id: int

class UserPreferenceUpdate(SQLModel):
    daily_calorie_goal: Optional[int] = None
    dietary_restrictions: Optional[List[str]] = None
    preferred_cuisines: Optional[List[str]] = None
    preferred_difficulty: Optional[str] = None
    max_prep_time_preference: Optional[int] = None
    max_calories_preference: Optional[int] = None
    avoid_missing_ingredients: Optional[bool] = None
    prioritize_expiring_ingredients: Optional[bool] = None
    other_preferences: Optional[Dict[str, Any]] = None
