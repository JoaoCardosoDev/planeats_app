from typing import List, Optional
from sqlalchemy.orm import Session
from sqlmodel import select, asc, desc
from datetime import date, timedelta
from app.crud.base import CRUDBase
from app.models.pantry_models import PantryItem, PantryItemCreate, PantryItemUpdate

class CRUDPantry(CRUDBase[PantryItem, PantryItemCreate, PantryItemUpdate]):
    def get_multi_by_user(
        self, 
        db: Session, 
        *, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        expiring_soon: Optional[bool] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "asc"
    ) -> List[PantryItem]:
        query = select(PantryItem).where(PantryItem.user_id == user_id)
        
        # Apply expiring_soon filter
        if expiring_soon:
            # Items expiring in the next 7 days
            expiry_threshold = date.today() + timedelta(days=7)
            query = query.where(
                PantryItem.expiration_date.is_not(None),
                PantryItem.expiration_date <= expiry_threshold
            )
        
        # Apply sorting
        if sort_by:
            # Map sort fields to model attributes
            sort_field_map = {
                "item_name": PantryItem.item_name,
                "expiration_date": PantryItem.expiration_date,
                "added_at": PantryItem.added_at,
                "quantity": PantryItem.quantity
            }
            
            if sort_by in sort_field_map:
                field = sort_field_map[sort_by]
                if sort_order == "desc":
                    query = query.order_by(desc(field))
                else:
                    query = query.order_by(asc(field))
        else:
            # Default sorting by added_at desc (newest first)
            query = query.order_by(desc(PantryItem.added_at))
        
        return db.exec(query.offset(skip).limit(limit)).all()
    
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
