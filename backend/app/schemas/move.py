from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class MoveBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    power: int = Field(default=50, ge=1, le=100)

class MoveCreate(MoveBase):
    pokemon_id: UUID

class MoveUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    power: Optional[int] = Field(None, ge=1, le=100)
    is_completed: Optional[bool] = None

class Move(MoveBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    pokemon_id: UUID
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime