import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
from decimal import Decimal

from app.main import app
from app.database.connection import get_db
from app.models.asset import Asset, AssetStatus, Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_asset_update.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
  try:
    db = TestingSessionLocal()
    yield db
  finally:
    db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function", autouse=True)
def setup_database():
  """Create a fresh database for each test"""
  Base.metadata.create_all(bind=engine)
  yield
  Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
  """Get database session for tests that need direct DB access"""
  db = TestingSessionLocal()
  try:
    yield db
  finally:
    db.close()

@pytest.fixture
def client():
  """Create test client"""
  return TestClient(app)

@pytest.fixture
def sample_asset(db_session):
  """Create a sample asset for testing updates"""
  asset_data = {
    "name": "Original Laptop",
    "description": "Original description",
    "category": "Electronics",
    "serial_number": "ORIG001",
    "purchase_date": date(2023, 1, 15),
    "purchase_price": Decimal("1200.00"),
    "status": AssetStatus.ACTIVE
  }
  
  db_asset = Asset(**asset_data)
  db_session.add(db_asset)
  db_session.commit()
  db_session.refresh(db_asset)
  
  return db_asset

@pytest.fixture
def multiple_assets(db_session):
  """Create multiple assets for testing duplicate serial number scenarios"""
  assets_data = [
    {
      "name": "Asset One",
      "description": "First asset",
      "category": "Electronics",
      "serial_number": "ASSET001",
      "purchase_date": date(2023, 1, 15),
      "purchase_price": Decimal("1000.00"),
      "status": AssetStatus.ACTIVE
    },
    {
      "name": "Asset Two",
      "description": "Second asset",
      "category": "Furniture",
      "serial_number": "ASSET002",
      "purchase_date": date(2023, 2, 10),
      "purchase_price": Decimal("500.00"),
      "status": AssetStatus.INACTIVE
    }
  ]
  
  created_assets = []
  for asset_data in assets_data:
    db_asset = Asset(**asset_data)
    db_session.add(db_asset)
    created_assets.append(db_asset)
  
  db_session.commit()
  
  for asset in created_assets:
    db_session.refresh(asset)
  
  return created_assets

@pytest.fixture
def update_asset_data():
  """Sample data for asset updates"""
  return {
    "name": "Updated Laptop",
    "description": "Updated description",
    "category": "Updated Electronics",
    "serial_number": "UPD001",
    "purchase_date": "2023-06-15",
    "purchase_price": 1500.00,
    "status": "maintenance"
  }

class TestAssetUpdate:
  """Test cases for asset update endpoint"""

  def test_update_asset_success(self, client, sample_asset, update_asset_data):
    """Test successful asset update"""
    asset_id = sample_asset.id
    response = client.put(f"/api/assets/{asset_id}", json=update_asset_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify all fields were updated
    assert data["id"] == asset_id
    assert data["name"] == update_asset_data["name"]
    assert data["description"] == update_asset_data["description"]
    assert data["category"] == update_asset_data["category"]
    assert data["serial_number"] == update_asset_data["serial_number"]
    assert data["purchase_date"] == update_asset_data["purchase_date"]
    assert float(data["purchase_price"]) == update_asset_data["purchase_price"]
    assert data["status"] == update_asset_data["status"]
    assert "created_at" in data
    assert "updated_at" in data

  def test_update_asset_partial_update(self, client, sample_asset):
    """Test partial asset update (only some fields)"""
    asset_id = sample_asset.id
    partial_data = {
      "name": "Partially Updated Laptop",
      "status": "maintenance"
    }
    
    response = client.put(f"/api/assets/{asset_id}", json=partial_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify updated fields
    assert data["name"] == partial_data["name"]
    assert data["status"] == partial_data["status"]
    
    # Verify unchanged fields remain the same
    assert data["description"] == sample_asset.description
    assert data["category"] == sample_asset.category
    assert data["serial_number"] == sample_asset.serial_number

  def test_update_asset_not_found(self, client, update_asset_data):
    """Test updating non-existent asset"""
    response = client.put("/api/assets/999", json=update_asset_data)
    
    assert response.status_code == 404
    error_data = response.json()
    assert error_data["detail"]["error"]["code"] == "ASSET_NOT_FOUND"
    assert "999" in error_data["detail"]["error"]["message"]

  def test_update_asset_duplicate_serial_number(self, client, multiple_assets, update_asset_data):
    """Test updating asset with duplicate serial number"""
    asset_to_update = multiple_assets[0]
    existing_serial = multiple_assets[1].serial_number
    
    # Try to update first asset with second asset's serial number
    update_data = update_asset_data.copy()
    update_data["serial_number"] = existing_serial
    
    response = client.put(f"/api/assets/{asset_to_update.id}", json=update_data)
    
    assert response.status_code == 409
    error_data = response.json()
    assert error_data["detail"]["error"]["code"] == "DUPLICATE_SERIAL_NUMBER"
    assert existing_serial in error_data["detail"]["error"]["message"]

  def test_update_asset_same_serial_number(self, client, sample_asset, update_asset_data):
    """Test updating asset with its own serial number (should succeed)"""
    asset_id = sample_asset.id
    
    # Update with same serial number
    update_data = update_asset_data.copy()
    update_data["serial_number"] = sample_asset.serial_number
    
    response = client.put(f"/api/assets/{asset_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["serial_number"] == sample_asset.serial_number

  def test_update_asset_invalid_name_length(self, client, sample_asset):
    """Test updating asset with invalid name length"""
    asset_id = sample_asset.id
    
    # Test empty name
    invalid_data = {"name": ""}
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

    # Test name too long
    invalid_data = {"name": "x" * 256}  # Exceeds 255 character limit
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

  def test_update_asset_invalid_category_length(self, client, sample_asset):
    """Test updating asset with invalid category length"""
    asset_id = sample_asset.id
    
    # Test empty category
    invalid_data = {"category": ""}
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

    # Test category too long
    invalid_data = {"category": "x" * 101}  # Exceeds 100 character limit
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

  def test_update_asset_invalid_serial_number_length(self, client, sample_asset):
    """Test updating asset with invalid serial number length"""
    asset_id = sample_asset.id
    
    # Test empty serial number
    invalid_data = {"serial_number": ""}
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

    # Test serial number too long
    invalid_data = {"serial_number": "x" * 101}  # Exceeds 100 character limit
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

  def test_update_asset_invalid_purchase_price(self, client, sample_asset):
    """Test updating asset with invalid purchase price"""
    asset_id = sample_asset.id
    
    # Test negative price
    invalid_data = {"purchase_price": -100.0}
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

    # Test zero price
    invalid_data = {"purchase_price": 0.0}
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

  def test_update_asset_invalid_status(self, client, sample_asset):
    """Test updating asset with invalid status"""
    asset_id = sample_asset.id
    invalid_data = {"status": "invalid_status"}
    
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

  def test_update_asset_invalid_date_format(self, client, sample_asset):
    """Test updating asset with invalid date format"""
    asset_id = sample_asset.id
    invalid_data = {"purchase_date": "invalid-date"}
    
    response = client.put(f"/api/assets/{asset_id}", json=invalid_data)
    assert response.status_code == 422

  def test_update_asset_all_statuses(self, client, sample_asset):
    """Test updating asset with all valid status values"""
    asset_id = sample_asset.id
    statuses = ["active", "inactive", "maintenance", "disposed"]
    
    for status in statuses:
      update_data = {"status": status}
      response = client.put(f"/api/assets/{asset_id}", json=update_data)
      
      assert response.status_code == 200
      data = response.json()
      assert data["status"] == status

  def test_update_asset_with_null_description(self, client, sample_asset):
    """Test updating asset with null description"""
    asset_id = sample_asset.id
    update_data = {"description": None}
    
    response = client.put(f"/api/assets/{asset_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["description"] is None

  def test_update_asset_decimal_precision(self, client, sample_asset):
    """Test updating asset with decimal precision for price"""
    asset_id = sample_asset.id
    update_data = {"purchase_price": 1234.56}
    
    response = client.put(f"/api/assets/{asset_id}", json=update_data)
    
    assert response.status_code == 200
    data = response.json()
    assert float(data["purchase_price"]) == 1234.56

  def test_update_asset_invalid_id_format(self, client, update_asset_data):
    """Test updating asset with invalid ID format"""
    response = client.put("/api/assets/invalid", json=update_asset_data)
    assert response.status_code == 422

  def test_update_asset_empty_data(self, client, sample_asset):
    """Test updating asset with empty data (should succeed with no changes)"""
    asset_id = sample_asset.id
    original_name = sample_asset.name
    original_status = sample_asset.status.value
    
    # Test with completely empty data - should succeed and return unchanged asset
    response = client.put(f"/api/assets/{asset_id}", json={})
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == original_name
    assert data["status"] == original_status

class TestAssetUpdateIntegration:
  """Integration tests for asset update functionality"""
  
  def test_asset_update_workflow(self, client, db_session):
    """Test complete asset update workflow"""
    # Create an asset first
    create_data = {
      "name": "Original Asset",
      "description": "Original description",
      "category": "Original Category",
      "serial_number": "ORIG001",
      "purchase_date": "2023-01-01",
      "purchase_price": 100.00,
      "status": "active"
    }
    
    create_response = client.post("/api/assets/", json=create_data)
    assert create_response.status_code == 201
    created_asset = create_response.json()
    asset_id = created_asset["id"]
    
    # Update the asset
    update_data = {
      "name": "Updated Asset",
      "description": "Updated description",
      "category": "Updated Category",
      "serial_number": "UPD001",
      "purchase_date": "2023-06-01",
      "purchase_price": 200.00,
      "status": "maintenance"
    }
    
    update_response = client.put(f"/api/assets/{asset_id}", json=update_data)
    assert update_response.status_code == 200
    updated_asset = update_response.json()
    
    # Verify all fields were updated
    assert updated_asset["name"] == update_data["name"]
    assert updated_asset["description"] == update_data["description"]
    assert updated_asset["category"] == update_data["category"]
    assert updated_asset["serial_number"] == update_data["serial_number"]
    assert updated_asset["purchase_date"] == update_data["purchase_date"]
    assert float(updated_asset["purchase_price"]) == update_data["purchase_price"]
    assert updated_asset["status"] == update_data["status"]
    
    # Verify the asset can be retrieved with updated data
    get_response = client.get(f"/api/assets/{asset_id}")
    assert get_response.status_code == 200
    retrieved_asset = get_response.json()
    
    assert retrieved_asset["name"] == update_data["name"]
    assert retrieved_asset["description"] == update_data["description"]
    assert retrieved_asset["category"] == update_data["category"]
    assert retrieved_asset["serial_number"] == update_data["serial_number"]

  def test_multiple_updates_same_asset(self, client, sample_asset):
    """Test multiple sequential updates to the same asset"""
    asset_id = sample_asset.id
    
    # First update
    update1 = {"name": "First Update", "status": "maintenance"}
    response1 = client.put(f"/api/assets/{asset_id}", json=update1)
    assert response1.status_code == 200
    data1 = response1.json()
    assert data1["name"] == "First Update"
    assert data1["status"] == "maintenance"
    
    # Second update
    update2 = {"name": "Second Update", "status": "inactive"}
    response2 = client.put(f"/api/assets/{asset_id}", json=update2)
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["name"] == "Second Update"
    assert data2["status"] == "inactive"
    
    # Third update
    update3 = {"description": "Final description"}
    response3 = client.put(f"/api/assets/{asset_id}", json=update3)
    assert response3.status_code == 200
    data3 = response3.json()
    assert data3["name"] == "Second Update"  # Should remain from previous update
    assert data3["status"] == "inactive"     # Should remain from previous update
    assert data3["description"] == "Final description"

  def test_update_asset_and_verify_in_list(self, client, sample_asset):
    """Test updating asset and verifying it appears correctly in asset list"""
    asset_id = sample_asset.id
    
    # Update the asset
    update_data = {
      "name": "Updated for List Test",
      "category": "Updated Category",
      "status": "maintenance"
    }
    
    update_response = client.put(f"/api/assets/{asset_id}", json=update_data)
    assert update_response.status_code == 200
    
    # Get asset list and verify updated asset appears correctly
    list_response = client.get("/api/assets/")
    assert list_response.status_code == 200
    list_data = list_response.json()
    
    updated_asset_in_list = None
    for asset in list_data["assets"]:
      if asset["id"] == asset_id:
        updated_asset_in_list = asset
        break
    
    assert updated_asset_in_list is not None
    assert updated_asset_in_list["name"] == update_data["name"]
    assert updated_asset_in_list["category"] == update_data["category"]
    assert updated_asset_in_list["status"] == update_data["status"]