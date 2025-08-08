from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

if TYPE_CHECKING:
    from app.schemas.move import Move

class PokemonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(default="normal", pattern="^(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)$")

class PokemonCreate(PokemonBase):
    pass

class PokemonUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[str] = Field(None, pattern="^(normal|fire|water|electric|grass|ice|fighting|poison|ground|flying|psychic|bug|rock|ghost|dragon|dark|steel|fairy)$")

class Pokemon(PokemonBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    level: int = 1
    experience: float = 0
    evolution_stage: int = 1
    created_at: datetime
    updated_at: datetime

class PokemonWithMoves(Pokemon):
    moves: List["Move"] = []

# Resolve forward references
from app.schemas.move import Move
PokemonWithMoves.model_rebuild()