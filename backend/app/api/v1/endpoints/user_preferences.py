from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
import logging

from app.api.v1.deps import get_current_user, get_db
from app.models.user_models import User
from app.models.user_preference_models import (
    UserPreferenceRead, 
    UserPreferenceCreate, 
    UserPreferenceUpdate,
    DietaryRestriction,
    CuisineType,
    DifficultyLevel
)
from app.crud.crud_user_preferences import user_preference

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/preferences", response_model=UserPreferenceRead)
def get_user_preferences(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's preferences
    
    Returns the user's current preferences or creates default ones if none exist.
    """
    logger.info(f"Getting preferences for user {current_user.id}")
    
    preferences = user_preference.get_or_create_for_user(db, user_id=current_user.id)
    
    logger.info(f"Retrieved preferences for user {current_user.id}")
    return preferences

@router.put("/preferences", response_model=UserPreferenceRead)
def update_user_preferences(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    preferences_in: UserPreferenceUpdate
):
    """
    Update current user's preferences
    
    Updates the user's preferences with the provided values. Creates default preferences
    if none exist yet.
    
    **Dietary Restrictions:** vegetarian, vegan, gluten_free, lactose_free, keto, paleo, mediterranean
    
    **Cuisine Types:** portuguese, italian, asian, mexican, healthy, comfort_food, mediterranean, indian, french, american
    
    **Difficulty Levels:** easy, medium, hard
    """
    logger.info(f"Updating preferences for user {current_user.id}")
    
    # Validate dietary restrictions
    if preferences_in.dietary_restrictions:
        valid_restrictions = [restriction.value for restriction in DietaryRestriction]
        for restriction in preferences_in.dietary_restrictions:
            if restriction not in valid_restrictions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid dietary restriction: {restriction}. Valid options: {valid_restrictions}"
                )
    
    # Validate cuisine types (now using cuisine_preferences as the primary field)
    if preferences_in.cuisine_preferences: # Changed from preferred_cuisines
        valid_cuisines = [cuisine.value for cuisine in CuisineType]
        for cuisine in preferences_in.cuisine_preferences: # Changed from preferred_cuisines
            if cuisine not in valid_cuisines:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid cuisine_preferences type: {cuisine}. Valid options: {valid_cuisines}" # Changed message
                )
    
    # Validate difficulty level
    if preferences_in.preferred_difficulty:
        valid_difficulties = [difficulty.value for difficulty in DifficultyLevel]
        if preferences_in.preferred_difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid difficulty level: {preferences_in.preferred_difficulty}. Valid options: {valid_difficulties}"
            )
    
    # Validate numeric preferences
    if preferences_in.daily_calorie_goal is not None and preferences_in.daily_calorie_goal <= 0:
        raise HTTPException(status_code=400, detail="Daily calorie goal must be positive")
    
    if preferences_in.max_prep_time_preference is not None and preferences_in.max_prep_time_preference <= 0:
        raise HTTPException(status_code=400, detail="Max preparation time must be positive")
    
    if preferences_in.max_calories_preference is not None and preferences_in.max_calories_preference <= 0:
        raise HTTPException(status_code=400, detail="Max calories preference must be positive")
    
    updated_preferences = user_preference.update_for_user(
        db, user_id=current_user.id, obj_in=preferences_in
    )
    
    if not updated_preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    
    logger.info(f"Updated preferences for user {current_user.id}")
    return updated_preferences

@router.post("/preferences", response_model=UserPreferenceRead)
def create_user_preferences(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    preferences_in: UserPreferenceCreate
):
    """
    Create user preferences
    
    Creates new preferences for the user. If preferences already exist, updates them instead.
    """
    logger.info(f"Creating preferences for user {current_user.id}")
    
    # Validate input similar to update endpoint
    if preferences_in.dietary_restrictions:
        valid_restrictions = [restriction.value for restriction in DietaryRestriction]
        for restriction in preferences_in.dietary_restrictions:
            if restriction not in valid_restrictions:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid dietary restriction: {restriction}. Valid options: {valid_restrictions}"
                )
    
    # Validate cuisine_preferences (field name changed in UserPreferenceCreate via UserPreferenceBase)
    if preferences_in.cuisine_preferences:
        valid_cuisines = [cuisine.value for cuisine in CuisineType]
        for cuisine in preferences_in.cuisine_preferences: # Changed from preferred_cuisines
            if cuisine not in valid_cuisines:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid cuisine_preferences type: {cuisine}. Valid options: {valid_cuisines}" # Changed message
                )
    
    if preferences_in.preferred_difficulty:
        valid_difficulties = [difficulty.value for difficulty in DifficultyLevel]
        if preferences_in.preferred_difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid difficulty level: {preferences_in.preferred_difficulty}. Valid options: {valid_difficulties}"
            )
    
    created_preferences = user_preference.create_for_user(
        db, obj_in=preferences_in, user_id=current_user.id
    )
    
    logger.info(f"Created preferences for user {current_user.id}")
    return created_preferences

@router.get("/preferences/options")
def get_preference_options():
    """
    Get available preference options
    
    Returns all available options for dietary restrictions, cuisine types, and difficulty levels.
    Useful for populating frontend dropdowns and form controls.
    """
    return {
        "dietary_restrictions": [restriction.value for restriction in DietaryRestriction],
        "cuisine_types": [cuisine.value for cuisine in CuisineType],
        "difficulty_levels": [difficulty.value for difficulty in DifficultyLevel]
    }
