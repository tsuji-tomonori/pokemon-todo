from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
import re

class MoveBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="Move/Task name",
        examples=["Complete documentation", "Fix bug #123"]
    )
    description: Optional[str] = Field(
        None, 
        max_length=500,
        description="Detailed description of the move/task"
    )
    power: int = Field(
        default=50, 
        ge=1, 
        le=100,
        description="Power/Priority level (1-100)"
    )
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate and sanitize move name"""
        # Remove leading/trailing whitespace
        v = v.strip()
        
        # Normalize multiple spaces to single space
        v = ' '.join(v.split())
        
        # Check minimum meaningful length (allow shorter names for Japanese/CJK characters)
        if len(v) < 1:
            raise ValueError('Move name cannot be empty')
        
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate and sanitize description"""
        if v is None:
            return v
            
        # Remove leading/trailing whitespace
        v = v.strip()
        
        # If empty after stripping, return None
        if not v:
            return None
            
        # Normalize multiple spaces/newlines
        v = ' '.join(v.split())
        
        return v
    
    @field_validator('power')
    @classmethod
    def validate_power(cls, v: int) -> int:
        """Validate power is in reasonable ranges"""
        # Define power categories for better UX
        if v <= 0:
            raise ValueError('Power must be greater than 0')
        if v > 100:
            raise ValueError('Power cannot exceed 100')
        return v

class MoveCreate(MoveBase):
    pokemon_id: UUID

class MoveUpdate(BaseModel):
    name: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=100,
        description="Move/Task name"
    )
    description: Optional[str] = Field(
        None, 
        max_length=500,
        description="Detailed description"
    )
    power: Optional[int] = Field(
        None, 
        ge=1, 
        le=100,
        description="Power/Priority level"
    )
    is_completed: Optional[bool] = Field(
        None,
        description="Completion status"
    )
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate name if provided"""
        if v is None:
            return v
        v = v.strip()
        v = ' '.join(v.split())
        if len(v) < 1:
            raise ValueError('Move name cannot be empty')
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate description if provided"""
        if v is None:
            return v
        v = v.strip()
        if not v:
            return None
        v = ' '.join(v.split())
        return v

class Move(MoveBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    pokemon_id: UUID
    is_completed: bool = Field(default=False, description="Whether the move/task is completed")
    completed_at: Optional[datetime] = Field(None, description="Timestamp when the move was completed")
    created_at: datetime
    updated_at: datetime
    
    @model_validator(mode='after')
    def validate_completion_consistency(self) -> 'Move':
        """Ensure completion status and timestamp are consistent"""
        if self.is_completed and self.completed_at is None:
            # This is okay - the service layer should handle setting completed_at
            pass
        elif not self.is_completed and self.completed_at is not None:
            raise ValueError('Move cannot have completed_at timestamp when not completed')
        return self