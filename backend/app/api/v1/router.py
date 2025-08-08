from fastapi import APIRouter
from app.api.v1 import pokemon, moves

api_router = APIRouter()

# Include routers
api_router.include_router(pokemon.router, prefix="/pokemon", tags=["pokemon"])
api_router.include_router(moves.router, prefix="/moves", tags=["moves"])
# api_router.include_router(battle.router, prefix="/battles", tags=["battles"])
# api_router.include_router(ai.router, prefix="/ai", tags=["ai"])