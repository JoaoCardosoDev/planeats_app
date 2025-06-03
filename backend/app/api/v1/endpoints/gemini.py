from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
import uuid
import logging

from app.api.v1.deps import get_current_user, get_db
from app.models.user_models import User
from app.models.pantry_models import PantryItem
from app.crud.crud_pantry import pantry as crud_pantry
from app.services.gemini_service import test_gemini_connection, generate_custom_recipe
from app.schemas.ai_recipes import CustomRecipeRequest, CustomRecipeResponse, UsedPantryItem

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/test-gemini")
def test_gemini_endpoint():
    """Test endpoint to verify Gemini API connectivity"""
    logger.info("Received request for /test-gemini endpoint.")
    return test_gemini_connection()

@router.post("/custom-recipes", response_model=CustomRecipeResponse)
def create_custom_recipe(
    *,
    db: Session = Depends(get_db),
    recipe_request: CustomRecipeRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a custom recipe using AI based on pantry items and preferences
    """
    logger.info(f"Received custom recipe request from user {current_user.id}")
    
    # Validate that pantry_item_ids is provided and not empty
    if not recipe_request.pantry_item_ids:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="pantry_item_ids cannot be empty"
        )
    
    try:
        # Fetch pantry items from database
        pantry_items = []
        used_pantry_items = []
        
        for item_id in recipe_request.pantry_item_ids:
            pantry_item = crud_pantry.get(db=db, id=item_id)
            
            if not pantry_item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pantry item with ID {item_id} not found"
                )
            
            # Check if the pantry item belongs to the current user
            if pantry_item.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You don't have access to pantry item {item_id}"
                )
            
            # Convert pantry item to dict for Gemini service
            item_dict = {
                "item_name": pantry_item.item_name,
                "quantity": pantry_item.quantity,
                "unit": pantry_item.unit,
                "expiration_date": pantry_item.expiration_date.isoformat() if pantry_item.expiration_date else None,
                "calories_per_unit": pantry_item.calories_per_unit
            }
            pantry_items.append(item_dict)
            
            # Prepare used pantry items for response
            used_pantry_items.append(UsedPantryItem(
                pantry_item_id=pantry_item.id,
                item_name=pantry_item.item_name,
                quantity_used=pantry_item.quantity,  # For now, assume we use all available quantity
                unit=pantry_item.unit
            ))
        
        logger.info(f"Found {len(pantry_items)} pantry items for recipe generation")
        
        # Generate recipe using Gemini API
        generation_result = generate_custom_recipe(
            pantry_items=pantry_items,
            max_calories=recipe_request.max_calories,
            preparation_time_limit=recipe_request.preparation_time_limit,
            dietary_restrictions=recipe_request.dietary_restrictions,
            cuisine_preference=recipe_request.cuisine_preference,
            additional_notes=recipe_request.additional_notes
        )
        
        if not generation_result["success"]:
            logger.error(f"Recipe generation failed: {generation_result.get('error', 'Unknown error')}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate recipe: {generation_result.get('error', 'Unknown error')}"
            )
        
        # Generate a unique ID for this generation session
        generation_id = str(uuid.uuid4())
        
        logger.info(f"Successfully generated recipe with ID: {generation_id}")
        
        # Return the response
        return CustomRecipeResponse(
            generated_recipe=generation_result["recipe"],
            used_pantry_items=used_pantry_items,
            generation_metadata=generation_result["metadata"],
            generation_id=generation_id
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Unexpected error in custom recipe generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the recipe"
        )
