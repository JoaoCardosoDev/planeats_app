from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Session

from app.services.mealdb_service import (
    mealdb_service, 
    MealDBMeal, 
    MealDBCategory, 
    MealDBArea, 
    MealDBIngredientInfo
)
from app.services.mealdb_import_service import mealdb_import_service
from app.api.v1.deps import get_current_user, get_db
from app.models.user_models import User

router = APIRouter()

class MealDBSearchResponse(BaseModel):
    """Response model for meal searches"""
    meals: List[MealDBMeal]
    total: int

class MealDBCategoriesResponse(BaseModel):
    """Response model for categories"""
    categories: List[MealDBCategory]
    total: int

class MealDBAreasResponse(BaseModel):
    """Response model for areas/cuisines"""
    areas: List[MealDBArea]
    total: int

class MealDBIngredientsResponse(BaseModel):
    """Response model for ingredients"""
    ingredients: List[MealDBIngredientInfo]
    total: int

@router.get("/search", response_model=MealDBSearchResponse)
async def search_meals(
    name: Optional[str] = Query(None, description="Search meals by name"),
    letter: Optional[str] = Query(None, description="Search meals by first letter (a-z)"),
    ingredient: Optional[str] = Query(None, description="Filter meals by main ingredient"),
    category: Optional[str] = Query(None, description="Filter meals by category"),
    area: Optional[str] = Query(None, description="Filter meals by area/cuisine")
):
    """
    Search meals from The Meal DB API with various filters
    
    You can search by:
    - name: Search for meals by name (e.g., "Arrabiata")
    - letter: List meals starting with a specific letter (a-z)
    - ingredient: Filter meals containing a specific ingredient (e.g., "chicken_breast")
    - category: Filter meals by category (e.g., "Seafood")
    - area: Filter meals by cuisine/area (e.g., "Italian")
    
    Only one search parameter should be provided at a time.
    """
    try:
        # Validate that only one search parameter is provided
        search_params = [name, letter, ingredient, category, area]
        provided_params = [p for p in search_params if p is not None]
        
        if len(provided_params) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one search parameter must be provided (name, letter, ingredient, category, or area)"
            )
        
        if len(provided_params) > 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only one search parameter can be provided at a time"
            )
        
        meals = []
        
        if name:
            meals = await mealdb_service.search_meals_by_name(name)
        elif letter:
            if len(letter) != 1 or not letter.isalpha():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Letter must be a single alphabetic character (a-z)"
                )
            meals = await mealdb_service.search_meals_by_first_letter(letter)
        elif ingredient:
            meals = await mealdb_service.filter_by_ingredient(ingredient)
        elif category:
            meals = await mealdb_service.filter_by_category(category)
        elif area:
            meals = await mealdb_service.filter_by_area(area)
        
        return MealDBSearchResponse(
            meals=meals,
            total=len(meals)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching meals: {str(e)}"
        )

@router.get("/meal/{meal_id}", response_model=MealDBMeal)
async def get_meal(meal_id: str):
    """
    Get full meal details by MealDB ID
    
    Example: /api/v1/mealdb/meal/52772
    """
    try:
        meal = await mealdb_service.get_meal_by_id(meal_id)
        
        if not meal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Meal with ID {meal_id} not found"
            )
        
        return meal
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving meal: {str(e)}"
        )

@router.get("/random", response_model=MealDBMeal)
async def get_random_meal():
    """
    Get a random meal from The Meal DB
    
    Perfect for meal inspiration!
    """
    try:
        meal = await mealdb_service.get_random_meal()
        
        if not meal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No random meal found"
            )
        
        return meal
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting random meal: {str(e)}"
        )

@router.get("/categories", response_model=MealDBCategoriesResponse)
async def get_categories():
    """
    Get all available meal categories
    
    Returns categories like Beef, Chicken, Dessert, etc.
    """
    try:
        categories = await mealdb_service.get_categories()
        
        return MealDBCategoriesResponse(
            categories=categories,
            total=len(categories)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving categories: {str(e)}"
        )

@router.get("/areas", response_model=MealDBAreasResponse)
async def get_areas():
    """
    Get all available cuisine areas
    
    Returns areas like Italian, Chinese, Mexican, etc.
    """
    try:
        areas = await mealdb_service.get_areas()
        
        return MealDBAreasResponse(
            areas=areas,
            total=len(areas)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving areas: {str(e)}"
        )

@router.get("/ingredients", response_model=MealDBIngredientsResponse)
async def get_ingredients():
    """
    Get all available ingredients
    
    Returns comprehensive list of ingredients available in The Meal DB
    """
    try:
        ingredients = await mealdb_service.get_ingredients_list()
        
        return MealDBIngredientsResponse(
            ingredients=ingredients,
            total=len(ingredients)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving ingredients: {str(e)}"
        )

@router.get("/ingredient-image/{ingredient_name}")
async def get_ingredient_image_url(
    ingredient_name: str,
    size: str = Query("medium", description="Image size: small, medium, or large")
):
    """
    Get ingredient image URL
    
    Returns the URL for an ingredient image in the specified size.
    """
    if size not in ["small", "medium", "large"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Size must be 'small', 'medium', or 'large'"
        )
    
    return {
        "ingredient_name": ingredient_name,
        "size": size,
        "image_url": mealdb_service.get_ingredient_image_url(ingredient_name, size)
    }

@router.get("/meal-thumbnail")
async def get_meal_thumbnail_url(
    image_url: str = Query(..., description="Original meal image URL"),
    size: str = Query("medium", description="Thumbnail size: small, medium, or large")
):
    """
    Get meal thumbnail URL in different sizes
    
    Takes an original meal image URL and returns the thumbnail version.
    """
    if size not in ["small", "medium", "large"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Size must be 'small', 'medium', or 'large'"
        )
    
    return {
        "original_url": image_url,
        "size": size,
        "thumbnail_url": mealdb_service.get_meal_thumbnail_url(image_url, size)
    }

@router.post("/import/{meal_id}")
async def import_meal(
    meal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Import a MealDB recipe into user's personal collection
    
    This converts a MealDB recipe into the user's recipe format with:
    - Estimated calories and prep time
    - Enhanced instructions with video/source links
    - Attribution to MealDB
    """
    try:
        result = await mealdb_import_service.import_meal_by_id(
            db=db,
            meal_id=meal_id,
            user=current_user
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": f"Successfully imported recipe '{result['recipe_name']}'",
            "recipe": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing meal: {str(e)}"
        )

@router.post("/import-random")
async def import_random_meal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Import a random MealDB recipe into user's personal collection
    
    Perfect for discovering new recipes!
    """
    try:
        result = await mealdb_import_service.import_random_meal(
            db=db,
            user=current_user
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "message": f"Successfully imported random recipe '{result['recipe_name']}'",
            "recipe": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing random meal: {str(e)}"
        )

@router.get("/suggestions-by-pantry", response_model=MealDBSearchResponse)
async def get_recipe_suggestions_by_pantry(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(10, description="Number of recipe suggestions to return")
):
    """
    Get MealDB recipe suggestions based on user's pantry ingredients
    
    Analyzes the user's pantry and suggests recipes that use those ingredients.
    """
    try:
        # Get user's pantry ingredients
        from app.crud.crud_pantry import pantry as crud_pantry
        
        pantry_items = crud_pantry.get_multi_by_user(
            db=db,
            user_id=current_user.id,
            skip=0,
            limit=50  # Get up to 50 pantry items
        )
        
        if not pantry_items:
            return MealDBSearchResponse(
                meals=[],
                total=0
            )
        
        # Extract ingredient names
        ingredient_names = [item.ingredient_name.lower() for item in pantry_items]
        
        # Get recipe suggestions
        suggested_meals = await mealdb_import_service.suggest_recipes_by_pantry_ingredients(
            db=db,
            user_ingredients=ingredient_names,
            limit=limit
        )
        
        return MealDBSearchResponse(
            meals=suggested_meals,
            total=len(suggested_meals)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting recipe suggestions: {str(e)}"
        )

@router.get("/test-connection")
async def test_mealdb_connection():
    """
    Test connection to The Meal DB API
    
    Useful for debugging and verifying API connectivity.
    """
    try:
        # Test by getting a random meal
        meal = await mealdb_service.get_random_meal()
        
        if meal:
            return {
                "status": "success",
                "message": "Successfully connected to The Meal DB API",
                "test_meal": {
                    "id": meal.id,
                    "name": meal.name,
                    "category": meal.category,
                    "area": meal.area
                }
            }
        else:
            return {
                "status": "warning",
                "message": "Connected to API but no test meal returned"
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to connect to The Meal DB API: {str(e)}"
        )
