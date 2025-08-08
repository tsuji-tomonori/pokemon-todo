from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Battle(Base):
    __tablename__ = "battles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pokemon_id = Column(UUID(as_uuid=True), ForeignKey("pokemon.id"), nullable=False)
    enemy_name = Column(String, nullable=False)
    enemy_max_hp = Column(Integer, default=100)
    enemy_current_hp = Column(Integer, default=100)
    total_damage = Column(Integer, default=0)
    is_victory = Column(Boolean, default=False)
    experience_gained = Column(Float, default=0)
    moves_used = Column(Integer, default=0)
    battle_duration = Column(Integer, default=0)  # in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    pokemon = relationship("Pokemon", back_populates="battles")