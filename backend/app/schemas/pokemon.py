from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from typing import Optional, List, TYPE_CHECKING, Literal
from datetime import datetime
from uuid import UUID
import re

if TYPE_CHECKING:
    from app.schemas.move import Move

# Define Pokemon types as a literal type for better type safety
PokemonType = Literal[
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
]

class PokemonBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="Pokemon name",
        examples=["Pikachu", "Charizard"]
    )
    type: PokemonType = Field(
        default="normal",
        description="Pokemon type"
    )
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and sanitize Pokemon name"""
        # Remove leading/trailing whitespace
        v = v.strip()
        
        # Normalize multiple spaces to single space
        v = ' '.join(v.split())
        
        # Allow any characters for Pokemon names (including Japanese, emojis, etc.)
        # Just ensure it's not empty and not too long
        if len(v) == 0:
            raise ValueError('Pokemon name cannot be empty')
        
        return v

class PokemonCreate(PokemonBase):
    pass

class PokemonUpdate(BaseModel):
    name: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=100,
        description="Pokemon name"
    )
    type: Optional[PokemonType] = Field(
        None,
        description="Pokemon type"
    )
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate and sanitize Pokemon name if provided"""
        if v is None:
            return v
            
        # Apply same validation as PokemonBase
        v = v.strip()
        
        # Normalize multiple spaces to single space
        v = ' '.join(v.split())
        
        # Allow any characters for Pokemon names
        if len(v) == 0:
            raise ValueError('Pokemon name cannot be empty')
        
        return v

class Pokemon(PokemonBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    level: int = Field(ge=1, le=100, default=1, description="Pokemon level (1-100)")
    experience: float = Field(ge=0, le=100, default=0, description="Experience points (0-100)")
    evolution_stage: int = Field(ge=1, le=3, default=1, description="Evolution stage (1-3)")
    created_at: datetime
    updated_at: datetime
    
    @model_validator(mode='after')
    def validate_evolution_requirements(self) -> 'Pokemon':
        """Validate evolution stage is appropriate for level"""
        # Evolution at levels 16 and 36
        if self.evolution_stage == 2 and self.level < 16:
            raise ValueError(f"Level {self.level} is too low for evolution stage 2 (requires level 16)")
        if self.evolution_stage == 3 and self.level < 36:
            raise ValueError(f"Level {self.level} is too low for evolution stage 3 (requires level 36)")
        return self

class PokemonWithMoves(Pokemon):
    moves: List["Move"] = []

# Resolve forward references
from app.schemas.move import Move
PokemonWithMoves.model_rebuild()