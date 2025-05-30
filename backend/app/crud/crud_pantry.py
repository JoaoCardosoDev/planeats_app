from typing import List
from sqlalchemy.orm import Session, select
from app.crud.base import CRUDBase
from app.models.pantry_models import PantryItem, PantryItemCreate, PantryItemUpdate

class CRUDPantry(CRUDBase[PantryItem, PantryItemCreate, PantryItemUpdate]):
    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[PantryItem]:
        return db.exec(
            select(PantryItem)
            .where(PantryItem.user_id == user_id)
            .offset(skip)
            .limit(limit)
        ).all()
    
    def create_with_user(
        self, db: Session, *, obj_in: PantryItemCreate, user_id: int
    ) -> PantryItem:
        db_obj = PantryItem(
            **obj_in.dict(),
            user_id=user_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

pantry = CRUDPantry(PantryItem)
