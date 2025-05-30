from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Optional

from app.api.v1.deps import get_current_user, get_db
from app.models.recipe_models import RecipeCreate, RecipeRead
from app.crud.crud_recipe import recipe as crud_recipe
from app.models.user import User

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
    limit: int = 100
):
    """
    Retrieve recipes accessible to current user (user's recipes + system recipes)
    """
    return crud_recipe.get_multi_by_user(
        db=db, 
        user_id=current_user.id,
        skip=skip,
        limit=limit
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