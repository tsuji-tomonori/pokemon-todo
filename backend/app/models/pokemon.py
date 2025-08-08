from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Pokemon(Base):
    __tablename__ = "pokemon"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="normal")
    level = Column(Integer, default=1)
    experience = Column(Float, default=0)
    evolution_stage = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    moves = relationship("Move", back_populates="pokemon", cascade="all, delete-orphan")
    battles = relationship("Battle", back_populates="pokemon", cascade="all, delete-orphan")