from fastapi import HTTPException
from typing import Any, Dict, Optional

class AssetManagementException(Exception):
  """Base exception for asset management system"""
  def __init__(self, message: str, code: str = "GENERAL_ERROR"):
    self.message = message
    self.code = code
    super().__init__(self.message)

class AssetNotFoundException(AssetManagementException):
  """Raised when an asset is not found"""
  def __init__(self, asset_id: int):
    super().__init__(f"Asset with ID {asset_id} not found", "ASSET_NOT_FOUND")
    self.asset_id = asset_id

class DuplicateSerialNumberException(AssetManagementException):
  """Raised when trying to create/update asset with duplicate serial number"""
  def __init__(self, serial_number: str):
    super().__init__(f"Asset with serial number '{serial_number}' already exists", "DUPLICATE_SERIAL_NUMBER")
    self.serial_number = serial_number

class ValidationException(AssetManagementException):
  """Raised when validation fails"""
  def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
    super().__init__(message, "VALIDATION_ERROR")
    self.details = details or {}

class DatabaseException(AssetManagementException):
  """Raised when database operation fails"""
  def __init__(self, message: str):
    super().__init__(f"Database error: {message}", "DATABASE_ERROR")

def create_http_exception(exc: AssetManagementException, status_code: int = 400) -> HTTPException:
  """Convert custom exception to HTTPException"""
  return HTTPException(
    status_code=status_code,
    detail={
      "error": {
        "code": exc.code,
        "message": exc.message,
        "details": getattr(exc, 'details', {})
      }
    }
  )