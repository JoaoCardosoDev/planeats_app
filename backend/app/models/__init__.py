from .user_models import User
from ..schemas.user import UserCreate, UserRead, UserUpdate
from .pantry_models import PantryItem #, PantryItemCreate, PantryItemRead, PantryItemUpdate
from .recipe_models import Recipe, RecipeIngredient #, RecipeCreate, RecipeRead, RecipeUpdate, RecipeIngredientCreate, RecipeIngredientRead
from .user_preference_models import UserPreference #, UserPreferenceCreate, UserPreferenceRead, UserPreferenceUpdate

# It's generally better to import schemas directly in the modules that need them (e.g., CRUD, API endpoints)
# rather than re-exporting them from the models package.
# For now, I'm only correcting the User schemas as per the error.
# The other schema imports (PantryItem, Recipe, UserPreference) are commented out as they likely follow the same pattern
# and might cause similar errors if not also moved to their respective schema files and imported correctly.

__all__ = [
    "User", "UserCreate", "UserRead", "UserUpdate", # These are correctly imported now
    "PantryItem", 
    "Recipe", 
    "RecipeIngredient", 
    "UserPreference", 
    # Commented out schema names that are not currently being imported:
    # "PantryItemCreate", "PantryItemRead", "PantryItemUpdate",
    # "RecipeCreate", "RecipeRead", "RecipeUpdate",
    # "RecipeIngredientCreate", "RecipeIngredientRead",
    # "UserPreferenceCreate", "UserPreferenceRead", "UserPreferenceUpdate",
]
