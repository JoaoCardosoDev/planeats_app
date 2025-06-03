from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List

from app.api.v1.deps import get_current_user, get_db
from app.models.pantry_models import PantryItemCreate, PantryItemRead
from app.crud.crud_pantry import pantry as crud_pantry
from app.models.user_models import User

router = APIRouter()

@router.post("/items", response_model=PantryItemRead)
def create_pantry_item(
    *,
    db: Session = Depends(get_db),
    item_in: PantryItemCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create new pantry item for current user
    """
    return crud_pantry.create_with_user(
        db=db, 
        obj_in=item_in, 
        user_id=current_user.id
    )


@router.get("/items", response_model=List[PantryItemRead])
def read_pantry_items(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve pantry items for current user
    """
    return crud_pantry.get_multi_by_user(
        db=db, 
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )









## get /items
## post /items