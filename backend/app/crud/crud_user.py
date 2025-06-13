from typing import Optional
from sqlmodel import Session, select
from app.crud.base import CRUDBase
from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Get user by email"""
        statement = select(User).where(User.email == email)
        return db.exec(statement).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """Get user by username"""
        statement = select(User).where(User.username == username)
        return db.exec(statement).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """Create new user with hashed password"""
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            is_active=True
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        """Check if user is active"""
        return user.is_active

    def is_email_taken(self, db: Session, *, email: str) -> bool:
        """Check if email is already taken"""
        return self.get_by_email(db, email=email) is not None

    def is_username_taken(self, db: Session, *, username: str) -> bool:
        """Check if username is already taken"""
        return self.get_by_username(db, username=username) is not None


user = CRUDUser(User)