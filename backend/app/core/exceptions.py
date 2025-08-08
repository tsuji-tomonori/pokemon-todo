from typing import Any, Dict, Optional
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

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

class ValidationException(HTTPException):
    """Custom exception for validation errors with detailed field information"""
    def __init__(self, errors: Dict[str, Any], message: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": message,
                "errors": errors
            }
        )

class DuplicateResourceException(HTTPException):
    """Exception for duplicate resource creation attempts"""
    def __init__(self, resource_type: str, field: str, value: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource_type} with {field} '{value}' already exists"
        )

class ResourceLimitException(HTTPException):
    """Exception for resource limit violations"""
    def __init__(self, resource_type: str, limit: int):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Maximum limit of {limit} {resource_type} reached"
        )

class BusinessRuleException(HTTPException):
    """Exception for business rule violations"""
    def __init__(self, message: str, code: Optional[str] = None):
        detail = {"message": message}
        if code:
            detail["code"] = code
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class DatabaseException(HTTPException):
    """Exception for database operation failures"""
    def __init__(self, operation: str, message: str):
        logger.error(f"Database error during {operation}: {message}")
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database operation failed: {operation}"
        )

class InsufficientExperienceException(HTTPException):
    """Exception for insufficient experience for evolution"""
    def __init__(self, required: float, current: float):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient experience for evolution. Required: {required}, Current: {current}"
        )

class InvalidEvolutionException(HTTPException):
    """Exception for invalid evolution attempts"""
    def __init__(self, pokemon_name: str, current_stage: int, max_stage: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{pokemon_name} is already at maximum evolution stage ({current_stage}/{max_stage})"
        )