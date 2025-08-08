from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, DataError
import logging
import traceback
from typing import Any, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

def create_error_response(
    request: Request,
    status_code: int,
    message: str,
    details: Any = None,
    error_code: str = None
) -> JSONResponse:
    """Create a standardized error response"""
    
    error_id = f"{datetime.utcnow().timestamp():.0f}"
    
    content: Dict[str, Any] = {
        "error": {
            "message": message,
            "status_code": status_code,
            "error_id": error_id,
            "path": str(request.url.path),
            "method": request.method,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    
    if details:
        content["error"]["details"] = details
    
    if error_code:
        content["error"]["code"] = error_code
    
    # Log the error
    logger.error(
        f"Error {error_id}: {message}",
        extra={
            "error_id": error_id,
            "status_code": status_code,
            "path": str(request.url.path),
            "method": request.method,
            "details": details
        }
    )
    
    return JSONResponse(
        status_code=status_code,
        content=content
    )

async def validation_error_handler(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """Handle validation errors from Pydantic"""
    
    # Format validation errors
    errors = {}
    for error in exc.errors():
        field_name = ".".join(str(loc) for loc in error["loc"][1:])
        if field_name not in errors:
            errors[field_name] = []
        errors[field_name].append({
            "message": error["msg"],
            "type": error["type"]
        })
    
    return create_error_response(
        request=request,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Validation failed",
        details=errors,
        error_code="VALIDATION_ERROR"
    )

async def database_error_handler(
    request: Request,
    exc: IntegrityError
) -> JSONResponse:
    """Handle database integrity errors"""
    
    error_message = str(exc.orig) if hasattr(exc, 'orig') else str(exc)
    
    # Check for common integrity errors
    if "duplicate key" in error_message.lower():
        return create_error_response(
            request=request,
            status_code=status.HTTP_409_CONFLICT,
            message="Resource already exists",
            details={"database_error": "Duplicate key violation"},
            error_code="DUPLICATE_RESOURCE"
        )
    elif "foreign key" in error_message.lower():
        return create_error_response(
            request=request,
            status_code=status.HTTP_400_BAD_REQUEST,
            message="Referenced resource not found",
            details={"database_error": "Foreign key constraint violation"},
            error_code="INVALID_REFERENCE"
        )
    else:
        return create_error_response(
            request=request,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message="Database operation failed",
            error_code="DATABASE_ERROR"
        )

async def general_exception_handler(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """Handle unexpected exceptions"""
    
    # Log the full traceback
    logger.error(
        f"Unexpected error: {exc}",
        exc_info=True,
        extra={
            "path": str(request.url.path),
            "method": request.method,
            "traceback": traceback.format_exc()
        }
    )
    
    # Don't expose internal errors in production
    return create_error_response(
        request=request,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="An unexpected error occurred",
        error_code="INTERNAL_ERROR"
    )

def register_error_handlers(app):
    """Register all error handlers with the FastAPI app"""
    from fastapi.exceptions import RequestValidationError
    from sqlalchemy.exc import IntegrityError, DataError
    
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(IntegrityError, database_error_handler)
    app.add_exception_handler(DataError, database_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)