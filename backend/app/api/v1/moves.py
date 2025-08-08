from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.move import Move, MoveCreate, MoveUpdate
from app.services.move_service import MoveService

router = APIRouter()

@router.post("/", response_model=Move, status_code=status.HTTP_201_CREATED)
def create_move(
    move_data: MoveCreate,
    db: Session = Depends(get_db)
):
    """Create a new Move for a Pokemon"""
    return MoveService.create_move(db, move_data)

@router.get("/pokemon/{pokemon_id}", response_model=List[Move])
def get_moves_by_pokemon(
    pokemon_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all moves for a specific Pokemon"""
    return MoveService.get_moves_by_pokemon(db, pokemon_id, skip=skip, limit=limit)

@router.get("/{move_id}", response_model=Move)
def get_move(
    move_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a Move by ID"""
    return MoveService.get_move(db, move_id)

@router.put("/{move_id}", response_model=Move)
def update_move(
    move_id: UUID,
    move_update: MoveUpdate,
    db: Session = Depends(get_db)
):
    """Update a Move"""
    return MoveService.update_move(db, move_id, move_update)

@router.delete("/{move_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_move(
    move_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a Move"""
    MoveService.delete_move(db, move_id)
    return None

@router.post("/{move_id}/complete", response_model=Move)
def complete_move(
    move_id: UUID,
    db: Session = Depends(get_db)
):
    """Mark a move as completed (execute the task)"""
    return MoveService.complete_move(db, move_id)

@router.get("/pokemon/{pokemon_id}/completed", response_model=List[Move])
def get_completed_moves(
    pokemon_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all completed moves for a Pokemon"""
    return MoveService.get_completed_moves(db, pokemon_id)

@router.get("/pokemon/{pokemon_id}/pending", response_model=List[Move])
def get_pending_moves(
    pokemon_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all pending (incomplete) moves for a Pokemon"""
    return MoveService.get_pending_moves(db, pokemon_id)