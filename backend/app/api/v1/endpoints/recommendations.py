from fastapi import APIRouter, Depends
from sqlmodel import Session
import logging

from app.api.v1.deps import get_current_user, get_db
from app.models.user_models import User
from app.services.recommendation_service import get_recipe_recommendations
from app.schemas.recommendations import RecipeRecommendationsResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/recommendations", response_model=RecipeRecommendationsResponse)
def get_recommendations(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get recipe recommendations based on user's pantry items
    
    Returns a list of recommended recipes that use ingredients from the user's pantry.
    Recipes are scored based on:
    - How many pantry ingredients they use
    - Whether they use expiring ingredients
    - Preparation time and completeness
    """
    logger.info(f"Getting recipe recommendations for user {current_user.id}")
    
    recommendations = get_recipe_recommendations(db=db, user_id=current_user.id)
    
    logger.info(f"Returning {len(recommendations.recommendations)} recommendations for user {current_user.id}")
    
    return recommendations
