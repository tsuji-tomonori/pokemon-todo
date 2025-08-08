from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class BattleBase(BaseModel):
    enemy_name: str = Field(..., min_length=1, max_length=100)
    enemy_max_hp: int = Field(default=100, ge=1)

class BattleCreate(BattleBase):
    pokemon_id: UUID

class Battle(BattleBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    pokemon_id: UUID
    enemy_current_hp: int
    total_damage: int = 0
    is_victory: bool = False
    experience_gained: float = 0
    moves_used: int = 0
    battle_duration: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None