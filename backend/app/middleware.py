from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
import logging
from .exceptions import (
  AssetManagementException,
  AssetNotFoundException,
  DuplicateSerialNumberException,
  ValidationException,
  DatabaseException,
  create_http_exception
)

logger = logging.getLogger(__name__)

async def exception_handler(request: Request, exc: Exception) -> JSONResponse:
  """Global exception handler for the application"""
  
  # Handle custom asset management exceptions
  if isinstance(exc, AssetNotFoundException):
    return JSONResponse(
      status_code=404,
      content={
        "error": {
          "code": exc.code,
          "message": exc.message
        }
      }
    )
  
  elif isinstance(exc, DuplicateSerialNumberException):
    return JSONResponse(
      status_code=409,
      content={
        "error": {
          "code": exc.code,
          "message": exc.message
        }
      }
    )
  
  elif isinstance(exc, ValidationException):
    return JSONResponse(
      status_code=422,
      content={
        "error": {
          "code": exc.code,
          "message": exc.message,
          "details": exc.details
        }
      }
    )
  
  elif isinstance(exc, DatabaseException):
    return JSONResponse(
      status_code=500,
      content={
        "error": {
          "code": exc.code,
          "message": exc.message
        }
      }
    )
  
  elif isinstance(exc, AssetManagementException):
    return JSONResponse(
      status_code=400,
      content={
        "error": {
          "code": exc.code,
          "message": exc.message
        }
      }
    )
  
  # Handle SQLAlchemy integrity errors (like unique constraint violations)
  elif isinstance(exc, IntegrityError):
    logger.error(f"Database integrity error: {str(exc)}")
    if "serial_number" in str(exc):
      return JSONResponse(
        status_code=409,
        content={
          "error": {
            "code": "DUPLICATE_SERIAL_NUMBER",
            "message": "An asset with this serial number already exists"
          }
        }
      )
    return JSONResponse(
      status_code=400,
      content={
        "error": {
          "code": "DATABASE_CONSTRAINT_ERROR",
          "message": "Database constraint violation"
        }
      }
    )
  
  # Handle FastAPI HTTPExceptions
  elif isinstance(exc, HTTPException):
    return JSONResponse(
      status_code=exc.status_code,
      content={
        "error": {
          "code": "HTTP_ERROR",
          "message": exc.detail
        }
      }
    )
  
  # Handle unexpected errors
  else:
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
      status_code=500,
      content={
        "error": {
          "code": "INTERNAL_SERVER_ERROR",
          "message": "An unexpected error occurred"
        }
      }
    )