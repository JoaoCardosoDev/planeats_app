from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from pydantic import BaseModel
from sqlmodel import Session
import httpx
import io
from fastapi.responses import StreamingResponse
import logging

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

logger = logging.getLogger(__name__)

router = APIRouter()

class MealDBSearchResponse(BaseModel):
    meals: List[MealDBMeal]
    total: int

class MealDBCategoriesResponse(BaseModel):
    categories: List[MealDBCategory]
    total: int

class MealDBAreasResponse(BaseModel):
    areas: List[MealDBArea]
    total: int

class MealDBIngredientsResponse(BaseModel):
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
    try:
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
        if name: meals = await mealdb_service.search_meals_by_name(name)
        elif letter:
            if len(letter) != 1 or not letter.isalpha():
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Letter must be a single alphabetic character (a-z)")
            meals = await mealdb_service.search_meals_by_first_letter(letter)
        elif ingredient: meals = await mealdb_service.filter_by_ingredient(ingredient)
        elif category: meals = await mealdb_service.filter_by_category(category)
        elif area: meals = await mealdb_service.filter_by_area(area)
        
        return MealDBSearchResponse(meals=meals, total=len(meals))
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error searching meals: {str(e)}")

@router.get("/meal/{meal_id}", response_model=MealDBMeal)
async def get_meal(meal_id: str):
    try:
        meal = await mealdb_service.get_meal_by_id(meal_id)
        if not meal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Meal with ID {meal_id} not found")
        return meal
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving meal: {str(e)}")

@router.get("/random", response_model=MealDBMeal)
async def get_random_meal():
    try:
        meal = await mealdb_service.get_random_meal()
        if not meal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No random meal found")
        return meal
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error getting random meal: {str(e)}")

@router.get("/categories", response_model=MealDBCategoriesResponse)
async def get_categories():
    try:
        categories = await mealdb_service.get_categories()
        return MealDBCategoriesResponse(categories=categories, total=len(categories))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving categories: {str(e)}")

@router.get("/areas", response_model=MealDBAreasResponse)
async def get_areas():
    try:
        areas = await mealdb_service.get_areas()
        return MealDBAreasResponse(areas=areas, total=len(areas))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving areas: {str(e)}")

@router.get("/ingredients", response_model=MealDBIngredientsResponse)
async def get_ingredients():
    try:
        ingredients = await mealdb_service.get_ingredients_list()
        return MealDBIngredientsResponse(ingredients=ingredients, total=len(ingredients))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error retrieving ingredients: {str(e)}")

@router.get("/ingredient-image/{ingredient_name}")
async def get_ingredient_image_proxy(
    ingredient_name: str,
    size: str = Query("medium", description="Image size: small, medium, or large. Default is medium (no suffix).")
):
    if size not in ["small", "medium", "large"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Size must be 'small', 'medium', or 'large'"
        )
    
    # mealdb_service.get_ingredient_image_url constructs the direct URL to TheMealDB
    image_url = mealdb_service.get_ingredient_image_url(ingredient_name, size)
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status() 
            
            content_type = response.headers.get("Content-Type", "image/png")
            
            return StreamingResponse(io.BytesIO(response.content), media_type=content_type)
            
    except httpx.HTTPStatusError as e:
        logger.error(f"MealDB image not found or error for {ingredient_name} ({size}): {e.response.status_code} from {image_url}")
        # Return a 404 or the status code from MealDB if preferred
        raise HTTPException(status_code=e.response.status_code, detail=f"Image not found on TheMealDB for {ingredient_name} (size: {size})")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching MealDB image for {ingredient_name} ({size}): {e} from {image_url}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Error fetching image from TheMealDB")
    except Exception as e:
        logger.error(f"Unexpected error proxying MealDB image for {ingredient_name} ({size}): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error proxying image")

@router.get("/meal-thumbnail")
async def get_meal_thumbnail_url_proxy( # Renamed to avoid confusion if it proxies
    image_url: str = Query(..., description="Original meal image URL"),
    size: str = Query("medium", description="Thumbnail size: small, medium, or large")
):
    if size not in ["small", "medium", "large"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Size must be 'small', 'medium', or 'large'"
        )
    
    # This service method likely just appends /preview or /small etc.
    # If it needs to actually fetch and return image data, it needs similar logic to get_ingredient_image_proxy
    thumbnail_url = mealdb_service.get_meal_thumbnail_url(image_url, size)
    
    # For now, assuming this endpoint is intended to return the URL, not proxy the image
    # If it needs to proxy, it requires httpx fetching and StreamingResponse like above.
    # Let's change it to proxy for consistency.
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(thumbnail_url) # Assuming thumbnail_url is the direct URL
            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "image/jpeg") # Meal thumbnails are often jpg
            return StreamingResponse(io.BytesIO(response.content), media_type=content_type)
    except httpx.HTTPStatusError as e:
        logger.error(f"MealDB thumbnail not found or error: {e.response.status_code} from {thumbnail_url}")
        raise HTTPException(status_code=e.response.status_code, detail="Thumbnail not found on TheMealDB")
    except httpx.RequestError as e:
        logger.error(f"Request error fetching MealDB thumbnail: {e} from {thumbnail_url}")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Error fetching thumbnail from TheMealDB")
    except Exception as e:
        logger.error(f"Unexpected error proxying MealDB thumbnail: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error proxying thumbnail")

@router.post("/import/{meal_id}")
async def import_meal(
    meal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await mealdb_import_service.import_meal_by_id(db=db, meal_id=meal_id, user=current_user)
        if not result["success"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
        return {"message": f"Successfully imported recipe '{result['recipe_name']}'", "recipe": result}
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error importing meal: {str(e)}")

@router.post("/import-random")
async def import_random_meal(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await mealdb_import_service.import_random_meal(db=db, user=current_user)
        if not result["success"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
        return {"message": f"Successfully imported random recipe '{result['recipe_name']}'", "recipe": result}
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error importing random meal: {str(e)}")

@router.get("/suggestions-by-pantry", response_model=MealDBSearchResponse)
async def get_recipe_suggestions_by_pantry(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(10, description="Number of recipe suggestions to return")
):
    try:
        from app.crud.crud_pantry import pantry as crud_pantry
        pantry_items = crud_pantry.get_multi_by_user(db=db, user_id=current_user.id, skip=0, limit=50)
        if not pantry_items:
            return MealDBSearchResponse(meals=[], total=0)
        
        ingredient_names = [item.item_name.lower() for item in pantry_items]
        suggested_meals = await mealdb_import_service.suggest_recipes_by_pantry_ingredients(db=db, user_ingredients=ingredient_names, limit=limit)
        return MealDBSearchResponse(meals=suggested_meals, total=len(suggested_meals))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error getting recipe suggestions: {str(e)}")

@router.get("/test-connection")
async def test_mealdb_connection():
    try:
        meal = await mealdb_service.get_random_meal()
        if meal:
            return {"status": "success", "message": "Successfully connected to The Meal DB API", "test_meal": {"id": meal.id, "name": meal.name, "category": meal.category, "area": meal.area}}
        else:
            return {"status": "warning", "message": "Connected to API but no test meal returned"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to connect to The Meal DB API: {str(e)}")
