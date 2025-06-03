from typing import List, Optional
from sqlalchemy.orm import Session
from sqlmodel import select
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
    
    def get_by_id_and_user(
        self, db: Session, *, id: int, user_id: int
    ) -> Optional[PantryItem]:
        return db.exec(
            select(PantryItem)
            .where(PantryItem.id == id)
            .where(PantryItem.user_id == user_id)
        ).first()
    
    def create_with_user(
        self, db: Session, *, obj_in: PantryItemCreate, user_id: int
    ) -> PantryItem:
        db_obj = PantryItem(
            **obj_in.model_dump(),
            user_id=user_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_by_user(
        self, db: Session, *, db_obj: PantryItem, obj_in: PantryItemUpdate, user_id: int
    ) -> Optional[PantryItem]:
        if db_obj.user_id != user_id:
            return None
        
        obj_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            setattr(db_obj, field, obj_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def delete_by_user(
        self, db: Session, *, id: int, user_id: int
    ) -> Optional[PantryItem]:
        obj = self.get_by_id_and_user(db=db, id=id, user_id=user_id)
        if obj:
            db.delete(obj)
            db.commit()
            return obj
        return None

pantry = CRUDPantry(PantryItem)
