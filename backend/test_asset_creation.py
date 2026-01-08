import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
from decimal import Decimal

from app.main import app
from app.database.connection import get_db, Base
from app.models.asset import Asset, AssetStatus

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_asset_creation.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
  try:
    db = TestingSessionLocal()
    yield db
  finally:
    db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def test_db():
  """Create test database tables"""
  Base.metadata.create_all(bind=engine)
  yield
  Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
  """Create test client"""
  return TestClient(app)

@pytest.fixture
def sample_asset_data():
  """Sample asset data for testing"""
  return {
    "name": "Test Laptop",
    "description": "A test laptop for development",
    "category": "Electronics",
    "serial_number": "TL001",
    "purchase_date": "2024-01-15",
    "purchase_price": 1299.99,
    "status": "active"
  }

class TestAssetCreation:
  """Test cases for asset creation endpoint"""

  def test_create_asset_success(self, client, test_db, sample_asset_data):
    """Test successful asset creation"""
    response = client.post("/api/assets/", json=sample_asset_data)
    
    assert response.status_code == 201
    data = response.json()
    
    # Verify response structure
    assert "id" in data
    assert data["name"] == sample_asset_data["name"]
    assert data["description"] == sample_asset_data["description"]
    assert data["category"] == sample_asset_data["category"]
    assert data["serial_number"] == sample_asset_data["serial_number"]
    assert data["purchase_date"] == sample_asset_data["purchase_date"]
    assert float(data["purchase_price"]) == sample_asset_data["purchase_price"]
    assert data["status"] == sample_asset_data["status"]
    assert "created_at" in data
    assert "updated_at" in data

  def test_create_asset_duplicate_serial_number(self, client, test_db, sample_asset_data):
    """Test asset creation with duplicate serial number"""
    # Create first asset
    response1 = client.post("/api/assets/", json=sample_asset_data)
    assert response1.status_code == 201
    
    # Try to create second asset with same serial number
    duplicate_data = sample_asset_data.copy()
    duplicate_data["name"] = "Another Laptop"
    
    response2 = client.post("/api/assets/", json=duplicate_data)
    assert response2.status_code == 409
    
    error_data = response2.json()
    assert error_data["detail"]["error"]["code"] == "DUPLICATE_SERIAL_NUMBER"
    assert "TL001" in error_data["detail"]["error"]["message"]

  def test_create_asset_missing_required_fields(self, client, test_db):
    """Test asset creation with missing required fields"""
    incomplete_data = {
      "name": "Test Asset",
      # Missing other required fields
    }
    
    response = client.post("/api/assets/", json=incomplete_data)
    assert response.status_code == 422
    
    error_data = response.json()
    assert "detail" in error_data

  def test_create_asset_invalid_name_length(self, client, test_db, sample_asset_data):
    """Test asset creation with invalid name length"""
    # Test empty name
    invalid_data = sample_asset_data.copy()
    invalid_data["name"] = ""
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

    # Test name too long
    invalid_data["name"] = "x" * 256  # Exceeds 255 character limit
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

  def test_create_asset_invalid_category_length(self, client, test_db, sample_asset_data):
    """Test asset creation with invalid category length"""
    # Test empty category
    invalid_data = sample_asset_data.copy()
    invalid_data["category"] = ""
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

    # Test category too long
    invalid_data["category"] = "x" * 101  # Exceeds 100 character limit
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

  def test_create_asset_invalid_serial_number_length(self, client, test_db, sample_asset_data):
    """Test asset creation with invalid serial number length"""
    # Test empty serial number
    invalid_data = sample_asset_data.copy()
    invalid_data["serial_number"] = ""
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

    # Test serial number too long
    invalid_data["serial_number"] = "x" * 101  # Exceeds 100 character limit
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

  def test_create_asset_invalid_purchase_price(self, client, test_db, sample_asset_data):
    """Test asset creation with invalid purchase price"""
    # Test negative price
    invalid_data = sample_asset_data.copy()
    invalid_data["purchase_price"] = -100.0
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

    # Test zero price
    invalid_data["purchase_price"] = 0.0
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

  def test_create_asset_invalid_status(self, client, test_db, sample_asset_data):
    """Test asset creation with invalid status"""
    invalid_data = sample_asset_data.copy()
    invalid_data["status"] = "invalid_status"
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

  def test_create_asset_invalid_date_format(self, client, test_db, sample_asset_data):
    """Test asset creation with invalid date format"""
    invalid_data = sample_asset_data.copy()
    invalid_data["purchase_date"] = "invalid-date"
    
    response = client.post("/api/assets/", json=invalid_data)
    assert response.status_code == 422

  def test_create_asset_all_statuses(self, client, test_db):
    """Test asset creation with all valid status values"""
    base_data = {
      "name": "Test Asset",
      "description": "Test description",
      "category": "Test Category",
      "purchase_date": "2024-01-15",
      "purchase_price": 100.0
    }
    
    statuses = ["active", "inactive", "maintenance", "disposed"]
    
    for i, status in enumerate(statuses):
      asset_data = base_data.copy()
      asset_data["serial_number"] = f"TEST{i:03d}"
      asset_data["status"] = status
      
      response = client.post("/api/assets/", json=asset_data)
      assert response.status_code == 201
      
      data = response.json()
      assert data["status"] == status

  def test_create_asset_with_optional_description(self, client, test_db, sample_asset_data):
    """Test asset creation with and without optional description"""
    # Test with description
    response1 = client.post("/api/assets/", json=sample_asset_data)
    assert response1.status_code == 201
    data1 = response1.json()
    assert data1["description"] == sample_asset_data["description"]
    
    # Test without description
    no_desc_data = sample_asset_data.copy()
    no_desc_data["serial_number"] = "TL002"
    del no_desc_data["description"]
    
    response2 = client.post("/api/assets/", json=no_desc_data)
    assert response2.status_code == 201
    data2 = response2.json()
    assert data2["description"] is None

  def test_create_asset_decimal_precision(self, client, test_db, sample_asset_data):
    """Test asset creation with decimal precision for price"""
    # Test with high precision decimal
    precise_data = sample_asset_data.copy()
    precise_data["serial_number"] = "TL003"
    precise_data["purchase_price"] = 1234.56
    
    response = client.post("/api/assets/", json=precise_data)
    assert response.status_code == 201
    
    data = response.json()
    assert float(data["purchase_price"]) == 1234.56