from typing import Optional
from sqlmodel import Session, select
from app.crud.base import CRUDBase
from app.models.user_preference_models import UserPreference, UserPreferenceCreate, UserPreferenceUpdate

class CRUDUserPreference(CRUDBase[UserPreference, UserPreferenceCreate, UserPreferenceUpdate]):
    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[UserPreference]:
        """Get user preferences by user ID"""
        statement = select(UserPreference).where(UserPreference.user_id == user_id)
        return db.exec(statement).first()
    
    def create_for_user(self, db: Session, *, obj_in: UserPreferenceCreate, user_id: int) -> UserPreference:
        """Create preferences for a specific user"""
        # Check if preferences already exist for this user
        existing = self.get_by_user_id(db, user_id=user_id)
        if existing:
            # Update existing preferences instead of creating new ones
            return self.update(db, db_obj=existing, obj_in=obj_in)
        
        # Create new preferences
        db_obj = UserPreference(**obj_in.model_dump(), user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_for_user(self, db: Session, *, user_id: int, obj_in: UserPreferenceUpdate) -> Optional[UserPreference]:
        """Update preferences for a specific user"""
        db_obj = self.get_by_user_id(db, user_id=user_id)
        if not db_obj:
            # Create default preferences if none exist
            create_obj = UserPreferenceCreate(**obj_in.model_dump(exclude_unset=True))
            return self.create_for_user(db, obj_in=create_obj, user_id=user_id)
        
        return self.update(db, db_obj=db_obj, obj_in=obj_in)
    
    def get_or_create_for_user(self, db: Session, *, user_id: int) -> UserPreference:
        """Get user preferences, creating default ones if they don't exist"""
        preferences = self.get_by_user_id(db, user_id=user_id)
        if not preferences:
            # Create default preferences
            default_preferences = UserPreferenceCreate()
            preferences = self.create_for_user(db, obj_in=default_preferences, user_id=user_id)
        return preferences

user_preference = CRUDUserPreference(UserPreference)
