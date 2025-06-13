from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import date, datetime

class PantryItemBase(SQLModel):
    item_name: str
    quantity: float
    unit: str
    expiration_date: Optional[date] = None
    purchase_date: Optional[date] = None
    calories_per_unit: Optional[int] = None
    image_url: Optional[str] = None

class PantryItem(PantryItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    added_at: datetime = Field(default_factory=datetime.utcnow)

class PantryItemCreate(PantryItemBase):
    pass

class PantryItemRead(PantryItemBase):
    id: int
    user_id: int
    added_at: datetime

class PantryItemUpdate(SQLModel):
    item_name: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiration_date: Optional[date] = None
    purchase_date: Optional[date] = None
    calories_per_unit: Optional[int] = None
    image_url: Optional[str] = None
