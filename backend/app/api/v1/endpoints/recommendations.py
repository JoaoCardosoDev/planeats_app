from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional, Literal
import logging

from app.api.v1.deps import get_current_user, get_db
from app.models.user_models import User
from app.services.recommendation_service import get_recipe_recommendations
from app.schemas.recommendations import (
    RecipeRecommendationsResponse, 
    RecommendationFilters, 
    RecommendationSort
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/recommendations", response_model=RecipeRecommendationsResponse)
def get_recommendations(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    # Filter parameters
    max_preparation_time: Optional[int] = Query(
        None, 
        description="Maximum preparation time in minutes",
        ge=1,
        le=480  # 8 hours max
    ),
    max_calories: Optional[int] = Query(
        None, 
        description="Maximum calories per serving",
        ge=1,
        le=5000
    ),
    max_missing_ingredients: Optional[int] = Query(
        None, 
        description="Maximum number of missing ingredients allowed",
        ge=0,
        le=20
    ),
    # Sort parameters
    sort_by: Literal["match_score", "preparation_time", "calories", "expiring_ingredients"] = Query(
        "match_score",
        description="Field to sort by"
    ),
    sort_order: Literal["asc", "desc"] = Query(
        "desc",
        description="Sort order - ascending or descending"
    ),
    # Preference parameters
    use_preferences: bool = Query(
        True,
        description="Whether to apply user preferences to recommendations"
    )
):
    """
    Get recipe recommendations based on user's pantry items with filtering, sorting, and preferences
    
    Returns a list of recommended recipes that use ingredients from the user's pantry.
    
    **Filtering Options:**
    - `max_preparation_time`: Filter recipes by maximum preparation time
    - `max_calories`: Filter recipes by maximum calories per serving
    - `max_missing_ingredients`: Filter recipes by maximum number of missing ingredients
    
    **Sorting Options:**
    - `sort_by`: Field to sort by (match_score, preparation_time, calories, expiring_ingredients)
    - `sort_order`: Sort order (asc for ascending, desc for descending)
    
    **Preference Integration:**
    - `use_preferences`: Enable/disable user preference-based filtering and scoring
    - Considers dietary restrictions (vegetarian, vegan, gluten-free, etc.)
    - Prioritizes preferred cuisine types (Portuguese, Italian, Asian, etc.)
    - Considers preferred difficulty level (easy, medium, hard)
    - Applies user's calorie and preparation time preferences
    - Provides bonus scoring for recipes that match user preferences
    
    **Default Behavior:**
    - No filters applied by default (shows all matching recipes)
    - Sorted by match_score in descending order (best matches first)
    - User preferences enabled by default for personalized recommendations
    
    **Recipe Scoring:**
    - Base score: proportion of pantry ingredients used in recipe
    - Bonus points for using expiring ingredients (waste reduction)
    - Bonus points for complete recipes (no missing ingredients)
    - **NEW:** Preference bonuses for matching dietary restrictions, cuisine types, and difficulty
    - **NEW:** Higher scores for recipes that align with user's food preferences
    
    **Returns:**
    - List of recommended recipes with detailed matching information
    - Metadata including filter counts and applied parameters
    - Informative messages for edge cases
    - Preference-aware scoring when enabled
    """
    logger.info(f"Getting recommendations for user {current_user.id} (preferences={use_preferences})")
    
    # Create filter and sort objects
    filters = RecommendationFilters(
        max_preparation_time=max_preparation_time,
        max_calories=max_calories,
        max_missing_ingredients=max_missing_ingredients
    )
    
    sort = RecommendationSort(
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    # Log applied filters for debugging
    applied_filters = []
    if max_preparation_time is not None:
        applied_filters.append(f"max_prep_time={max_preparation_time}min")
    if max_calories is not None:
        applied_filters.append(f"max_calories={max_calories}")
    if max_missing_ingredients is not None:
        applied_filters.append(f"max_missing={max_missing_ingredients}")
    
    logger.info(
        f"Filters: {', '.join(applied_filters) if applied_filters else 'none'}, "
        f"Sort: {sort_by} {sort_order}, "
        f"Preferences: {'enabled' if use_preferences else 'disabled'}"
    )
    
    recommendations = get_recipe_recommendations(
        db=db, 
        user_id=current_user.id,
        filters=filters,
        sort=sort,
        use_preferences=use_preferences
    )
    
    logger.info(
        f"Returning {len(recommendations.recommendations)} recommendations "
        f"(filtered from {recommendations.metadata.total_before_filters}) for user {current_user.id}"
    )
    
    return recommendations
