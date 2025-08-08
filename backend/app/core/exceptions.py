from fastapi import HTTPException, status

class PokemonNotFoundException(HTTPException):
    def __init__(self, pokemon_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pokemon with id {pokemon_id} not found"
        )

class MoveNotFoundException(HTTPException):
    def __init__(self, move_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Move with id {move_id} not found"
        )

class BattleNotFoundException(HTTPException):
    def __init__(self, battle_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Battle with id {battle_id} not found"
        )

class InvalidPowerValueException(HTTPException):
    def __init__(self, power: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid power value: {power}. Must be between 1 and 100"
        )

class AIServiceException(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI Service error: {message}"
        )