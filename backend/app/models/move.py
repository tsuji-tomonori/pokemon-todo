from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Move(Base):
    __tablename__ = "moves"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pokemon_id = Column(UUID(as_uuid=True), ForeignKey("pokemon.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    power = Column(Integer, default=50)  # 1-100
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pokemon = relationship("Pokemon", back_populates="moves")