from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.move import Move
from app.models.pokemon import Pokemon
from app.schemas.move import MoveCreate, MoveUpdate
from app.core.exceptions import MoveNotFoundException, PokemonNotFoundException

class MoveService:
    @staticmethod
    def create_move(db: Session, move_data: MoveCreate) -> Move:
        """Create a new Move for a Pokemon"""
        # Check if Pokemon exists
        pokemon = db.query(Pokemon).filter(Pokemon.id == move_data.pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(move_data.pokemon_id))
        
        move = Move(**move_data.model_dump())
        db.add(move)
        db.commit()
        db.refresh(move)
        return move
    
    @staticmethod
    def get_move(db: Session, move_id: UUID) -> Optional[Move]:
        """Get a Move by ID"""
        move = db.query(Move).filter(Move.id == move_id).first()
        if not move:
            raise MoveNotFoundException(str(move_id))
        return move
    
    @staticmethod
    def get_moves_by_pokemon(db: Session, pokemon_id: UUID, skip: int = 0, limit: int = 100) -> List[Move]:
        """Get all moves for a specific Pokemon"""
        # Check if Pokemon exists
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        
        return db.query(Move).filter(
            Move.pokemon_id == pokemon_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_move(db: Session, move_id: UUID, move_update: MoveUpdate) -> Move:
        """Update a Move"""
        move = db.query(Move).filter(Move.id == move_id).first()
        if not move:
            raise MoveNotFoundException(str(move_id))
        
        update_data = move_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(move, field, value)
        
        db.commit()
        db.refresh(move)
        return move
    
    @staticmethod
    def delete_move(db: Session, move_id: UUID) -> bool:
        """Delete a Move"""
        move = db.query(Move).filter(Move.id == move_id).first()
        if not move:
            raise MoveNotFoundException(str(move_id))
        
        db.delete(move)
        db.commit()
        return True
    
    @staticmethod
    def complete_move(db: Session, move_id: UUID) -> Move:
        """Mark a move as completed and return updated move"""
        move = db.query(Move).filter(Move.id == move_id).first()
        if not move:
            raise MoveNotFoundException(str(move_id))
        
        if not move.is_completed:
            move.is_completed = True
            move.completed_at = datetime.utcnow()
            db.commit()
            db.refresh(move)
        
        return move
    
    @staticmethod
    def get_completed_moves(db: Session, pokemon_id: UUID) -> List[Move]:
        """Get all completed moves for a Pokemon"""
        # Check if Pokemon exists
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        
        return db.query(Move).filter(
            Move.pokemon_id == pokemon_id,
            Move.is_completed == True
        ).all()
    
    @staticmethod
    def get_pending_moves(db: Session, pokemon_id: UUID) -> List[Move]:
        """Get all pending (incomplete) moves for a Pokemon"""
        # Check if Pokemon exists
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        
        return db.query(Move).filter(
            Move.pokemon_id == pokemon_id,
            Move.is_completed == False
        ).all()