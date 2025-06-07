from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List, Optional

from app.api.v1.deps import get_current_user, get_db
from app.models.pantry_models import PantryItemCreate, PantryItemRead, PantryItemUpdate
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
    limit: int = 100,
    expiring_soon: Optional[bool] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
):
    """
    Retrieve pantry items for current user with optional filtering and sorting
    
    - **expiring_soon**: Filter items expiring in the next 7 days
    - **sort_by**: Sort by field (item_name, expiration_date, added_at, quantity)  
    - **sort_order**: Sort order (asc, desc)
    """
    return crud_pantry.get_multi_by_user(
        db=db, 
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        expiring_soon=expiring_soon,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.get("/items/{item_id}", response_model=PantryItemRead)
def read_pantry_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get pantry item by ID for current user
    """
    item = crud_pantry.get_by_id_and_user(
        db=db, 
        id=item_id, 
        user_id=current_user.id
    )
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    return item


@router.put("/items/{item_id}", response_model=PantryItemRead)
def update_pantry_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    item_in: PantryItemUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update pantry item for current user
    """
    item = crud_pantry.get_by_id_and_user(
        db=db, 
        id=item_id, 
        user_id=current_user.id
    )
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    
    updated_item = crud_pantry.update_by_user(
        db=db, 
        db_obj=item, 
        obj_in=item_in, 
        user_id=current_user.id
    )
    if not updated_item:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return updated_item


@router.delete("/items/{item_id}")
def delete_pantry_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Delete pantry item for current user
    """
    item = crud_pantry.delete_by_user(
        db=db, 
        id=item_id, 
        user_id=current_user.id
    )
    if not item:
        raise HTTPException(status_code=404, detail="Pantry item not found")
    return {"message": "Pantry item deleted successfully"}
