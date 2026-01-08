import pytest
from datetime import date
from decimal import Decimal
from backend.app.schemas.asset import AssetCreate, AssetResponse, AssetListResponse
from backend.app.models.asset import AssetStatus
from backend.app.exceptions import (
  AssetNotFoundException,
  DuplicateSerialNumberException,
  ValidationException
)

def test_asset_schemas():
  """Test that Pydantic schemas work correctly"""
  # Test AssetCreate schema
  asset_data = {
    "name": "Test Laptop",
    "description": "A test laptop for development",
    "category": "Electronics",
    "serial_number": "TEST123",
    "purchase_date": date(2024, 1, 15),
    "purchase_price": Decimal("999.99"),
    "status": AssetStatus.ACTIVE
  }
  
  asset_create = AssetCreate(**asset_data)
  assert asset_create.name == "Test Laptop"
  assert asset_create.serial_number == "TEST123"
  assert asset_create.status == AssetStatus.ACTIVE

def test_custom_exceptions():
  """Test that custom exceptions work correctly"""
  # Test AssetNotFoundException
  exc = AssetNotFoundException(123)
  assert exc.asset_id == 123
  assert exc.code == "ASSET_NOT_FOUND"
  assert "123" in exc.message
  
  # Test DuplicateSerialNumberException
  exc = DuplicateSerialNumberException("TEST123")
  assert exc.serial_number == "TEST123"
  assert exc.code == "DUPLICATE_SERIAL_NUMBER"
  assert "TEST123" in exc.message
  
  # Test ValidationException
  exc = ValidationException("Invalid data", {"field": "error"})
  assert exc.code == "VALIDATION_ERROR"
  assert exc.details == {"field": "error"}

def test_asset_list_response():
  """Test AssetListResponse schema"""
  response = AssetListResponse(
    assets=[],
    total=0,
    page=1,
    page_size=20,
    total_pages=1
  )
  
  assert response.total == 0
  assert response.page == 1
  assert response.page_size == 20
  assert response.total_pages == 1

if __name__ == "__main__":
  test_asset_schemas()
  test_custom_exceptions()
  test_asset_list_response()
  print("All tests passed!")