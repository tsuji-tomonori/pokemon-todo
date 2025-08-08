from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.pokemon import Pokemon, PokemonCreate, PokemonUpdate, PokemonWithMoves
from app.services.pokemon_service import PokemonService

router = APIRouter()

@router.post("/", response_model=Pokemon, status_code=status.HTTP_201_CREATED)
def create_pokemon(
    pokemon_data: PokemonCreate,
    db: Session = Depends(get_db)
):
    """Create a new Pokemon"""
    return PokemonService.create_pokemon(db, pokemon_data)

@router.get("/", response_model=List[Pokemon])
def get_all_pokemon(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all Pokemon with pagination"""
    return PokemonService.get_all_pokemon(db, skip=skip, limit=limit)

@router.get("/{pokemon_id}", response_model=PokemonWithMoves)
def get_pokemon(
    pokemon_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a Pokemon by ID with its moves"""
    return PokemonService.get_pokemon(db, pokemon_id)

@router.put("/{pokemon_id}", response_model=Pokemon)
def update_pokemon(
    pokemon_id: UUID,
    pokemon_update: PokemonUpdate,
    db: Session = Depends(get_db)
):
    """Update a Pokemon"""
    return PokemonService.update_pokemon(db, pokemon_id, pokemon_update)

@router.delete("/{pokemon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pokemon(
    pokemon_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a Pokemon"""
    PokemonService.delete_pokemon(db, pokemon_id)
    return None

@router.post("/{pokemon_id}/add-experience", response_model=Pokemon)
def add_experience(
    pokemon_id: UUID,
    experience: float,
    db: Session = Depends(get_db)
):
    """Add experience to a Pokemon"""
    return PokemonService.add_experience(db, pokemon_id, experience)