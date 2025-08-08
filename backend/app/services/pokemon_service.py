from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.pokemon import Pokemon
from app.schemas.pokemon import PokemonCreate, PokemonUpdate
from app.core.exceptions import PokemonNotFoundException

class PokemonService:
    @staticmethod
    def create_pokemon(db: Session, pokemon_data: PokemonCreate) -> Pokemon:
        """Create a new Pokemon"""
        pokemon = Pokemon(**pokemon_data.model_dump())
        db.add(pokemon)
        db.commit()
        db.refresh(pokemon)
        return pokemon
    
    @staticmethod
    def get_pokemon(db: Session, pokemon_id: UUID) -> Optional[Pokemon]:
        """Get a Pokemon by ID"""
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        return pokemon
    
    @staticmethod
    def get_all_pokemon(db: Session, skip: int = 0, limit: int = 100) -> List[Pokemon]:
        """Get all Pokemon with pagination"""
        return db.query(Pokemon).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_pokemon(db: Session, pokemon_id: UUID, pokemon_update: PokemonUpdate) -> Pokemon:
        """Update a Pokemon"""
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        
        update_data = pokemon_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(pokemon, field, value)
        
        db.commit()
        db.refresh(pokemon)
        return pokemon
    
    @staticmethod
    def delete_pokemon(db: Session, pokemon_id: UUID) -> bool:
        """Delete a Pokemon"""
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        
        db.delete(pokemon)
        db.commit()
        return True
    
    @staticmethod
    def add_experience(db: Session, pokemon_id: UUID, experience: float) -> Pokemon:
        """Add experience to a Pokemon and handle level up"""
        pokemon = db.query(Pokemon).filter(Pokemon.id == pokemon_id).first()
        if not pokemon:
            raise PokemonNotFoundException(str(pokemon_id))
        
        pokemon.experience += experience
        
        # Level up logic (100 exp per level)
        while pokemon.experience >= 100:
            pokemon.level += 1
            pokemon.experience -= 100
            
            # Evolution logic (evolve at levels 16 and 36)
            if pokemon.level == 16 and pokemon.evolution_stage == 1:
                pokemon.evolution_stage = 2
            elif pokemon.level == 36 and pokemon.evolution_stage == 2:
                pokemon.evolution_stage = 3
        
        db.commit()
        db.refresh(pokemon)
        return pokemon