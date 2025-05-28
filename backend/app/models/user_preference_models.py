from sqlmodel import Field, SQLModel, Column, JSON
from typing import Optional, List, Dict, Any

class UserPreferenceBase(SQLModel):
    daily_calorie_goal: Optional[int] = None
    dietary_restrictions: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    other_preferences: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))

class UserPreference(UserPreferenceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True) # Ensure one-to-one

class UserPreferenceCreate(UserPreferenceBase):
    pass

class UserPreferenceRead(UserPreferenceBase):
    id: int
    user_id: int

class UserPreferenceUpdate(SQLModel):
    daily_calorie_goal: Optional[int] = None
    dietary_restrictions: Optional[List[str]] = None
    other_preferences: Optional[Dict[str, Any]] = None
