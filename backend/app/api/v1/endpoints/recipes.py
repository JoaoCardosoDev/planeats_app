from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional

from app.api.v1.deps import get_current_user, get_db
from app.models.recipe_models import RecipeCreate, RecipeRead
from app.crud.crud_recipe import recipe as crud_recipe
from app.models.user_models import User

router = APIRouter()

@router.post("/", response_model=RecipeRead)
def create_recipe(
    *,
    db: Session = Depends(get_db),
    recipe_in: RecipeCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new recipe for current user
    """
    return crud_recipe.create_with_user(
        db=db, 
        obj_in=recipe_in, 
        user_id=current_user.id
    )

@router.get("/", response_model=List[RecipeRead])
def read_recipes(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    # US3.2 Filter parameters
    user_created_only: Optional[bool] = Query(None, description="Filter to show only recipes created by the current user"),
    max_calories: Optional[int] = Query(None, description="Maximum calories per recipe"),
    max_prep_time: Optional[int] = Query(None, description="Maximum preparation time in minutes"),
    ingredients: Optional[List[str]] = Query(None, description="Filter recipes that contain these ingredients")
):
    """
    Retrieve recipes with optional filtering
    
    Filters available (US3.2):
    - user_created_only: Show only recipes created by current user
    - max_calories: Maximum calories per recipe
    - max_prep_time: Maximum preparation time in minutes
    - ingredients: List of ingredients that recipes must contain
    """
    return crud_recipe.get_multi_with_filters(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        user_created_only=user_created_only,
        max_calories=max_calories,
        max_prep_time=max_prep_time,
        ingredients=ingredients
    )

@router.get("/{recipe_id}", response_model=RecipeRead)
def read_recipe(
    *,
    db: Session = Depends(get_db),
    recipe_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get recipe by ID
    """
    recipe = crud_recipe.get_with_ingredients(db=db, id=recipe_id)
    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )
    
    # Check if user has access to this recipe
    # Users can access their own recipes or system recipes (created_by_user_id is None)
    if recipe.created_by_user_id is not None and recipe.created_by_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this recipe"
        )
    
    return recipe
