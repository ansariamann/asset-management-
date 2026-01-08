import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
from decimal import Decimal

from app.main import app
from app.database.connection import get_db
from app.models.asset import Asset, AssetStatus, Base
from app.schemas.asset import AssetCreate

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_asset_retrieval.db"
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
def db_session():
  """Create a fresh database for each test"""
  Base.metadata.create_all(bind=engine)
  db = TestingSessionLocal()
  try:
    yield db
  finally:
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
  """Create test client"""
  return TestClient(app)

@pytest.fixture
def sample_assets(db_session):
  """Create sample assets for testing"""
  assets_data = [
    {
      "name": "Laptop Dell XPS",
      "description": "High-performance laptop for development",
      "category": "Electronics",
      "serial_number": "DELL001",
      "purchase_date": date(2023, 1, 15),
      "purchase_price": Decimal("1200.00"),
      "status": AssetStatus.ACTIVE
    },
    {
      "name": "Office Chair",
      "description": "Ergonomic office chair",
      "category": "Furniture",
      "serial_number": "CHAIR001",
      "purchase_date": date(2023, 2, 10),
      "purchase_price": Decimal("300.00"),
      "status": AssetStatus.ACTIVE
    },
    {
      "name": "Monitor Samsung",
      "description": "24-inch 4K monitor",
      "category": "Electronics",
      "serial_number": "SAM001",
      "purchase_date": date(2023, 3, 5),
      "purchase_price": Decimal("400.00"),
      "status": AssetStatus.MAINTENANCE
    },
    {
      "name": "Desk Lamp",
      "description": "LED desk lamp with adjustable brightness",
      "category": "Furniture",
      "serial_number": "LAMP001",
      "purchase_date": date(2023, 4, 20),
      "purchase_price": Decimal("50.00"),
      "status": AssetStatus.INACTIVE
    },
    {
      "name": "Printer HP",
      "description": "Color laser printer",
      "category": "Electronics",
      "serial_number": "HP001",
      "purchase_date": date(2023, 5, 12),
      "purchase_price": Decimal("250.00"),
      "status": AssetStatus.DISPOSED
    }
  ]
  
  created_assets = []
  for asset_data in assets_data:
    db_asset = Asset(**asset_data)
    db_session.add(db_asset)
    created_assets.append(db_asset)
  
  db_session.commit()
  
  # Refresh to get IDs
  for asset in created_assets:
    db_session.refresh(asset)
  
  return created_assets

class TestGetAssets:
  """Test GET /api/assets endpoint"""
  
  def test_get_assets_default_pagination(self, client, sample_assets):
    """Test getting assets with default pagination"""
    response = client.get("/api/assets/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "assets" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "total_pages" in data
    
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total_pages"] == 1
    assert len(data["assets"]) == 5
  
  def test_get_assets_custom_pagination(self, client, sample_assets):
    """Test getting assets with custom pagination"""
    response = client.get("/api/assets/?page=1&page_size=2")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 3
    assert len(data["assets"]) == 2
  
  def test_get_assets_second_page(self, client, sample_assets):
    """Test getting second page of assets"""
    response = client.get("/api/assets/?page=2&page_size=2")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 5
    assert data["page"] == 2
    assert data["page_size"] == 2
    assert data["total_pages"] == 3
    assert len(data["assets"]) == 2
  
  def test_get_assets_last_page(self, client, sample_assets):
    """Test getting last page with remaining assets"""
    response = client.get("/api/assets/?page=3&page_size=2")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 5
    assert data["page"] == 3
    assert data["page_size"] == 2
    assert data["total_pages"] == 3
    assert len(data["assets"]) == 1
  
  def test_get_assets_search_by_name(self, client, sample_assets):
    """Test searching assets by name"""
    response = client.get("/api/assets/?search=Laptop")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 1
    assert len(data["assets"]) == 1
    assert "Laptop" in data["assets"][0]["name"]
  
  def test_get_assets_search_by_description(self, client, sample_assets):
    """Test searching assets by description"""
    response = client.get("/api/assets/?search=ergonomic")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 1
    assert len(data["assets"]) == 1
    assert "ergonomic" in data["assets"][0]["description"].lower()
  
  def test_get_assets_search_by_serial_number(self, client, sample_assets):
    """Test searching assets by serial number"""
    response = client.get("/api/assets/?search=DELL001")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 1
    assert len(data["assets"]) == 1
    assert data["assets"][0]["serial_number"] == "DELL001"
  
  def test_get_assets_search_case_insensitive(self, client, sample_assets):
    """Test that search is case insensitive"""
    response = client.get("/api/assets/?search=laptop")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 1
    assert len(data["assets"]) == 1
    assert "Laptop" in data["assets"][0]["name"]
  
  def test_get_assets_search_no_results(self, client, sample_assets):
    """Test search with no matching results"""
    response = client.get("/api/assets/?search=nonexistent")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 0
    assert len(data["assets"]) == 0
  
  def test_get_assets_filter_by_category(self, client, sample_assets):
    """Test filtering assets by category"""
    response = client.get("/api/assets/?category=Electronics")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 3
    assert len(data["assets"]) == 3
    for asset in data["assets"]:
      assert asset["category"] == "Electronics"
  
  def test_get_assets_filter_by_status(self, client, sample_assets):
    """Test filtering assets by status"""
    response = client.get("/api/assets/?status=active")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 2
    assert len(data["assets"]) == 2
    for asset in data["assets"]:
      assert asset["status"] == "active"
  
  def test_get_assets_combined_filters(self, client, sample_assets):
    """Test combining multiple filters"""
    response = client.get("/api/assets/?category=Electronics&status=active")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 1
    assert len(data["assets"]) == 1
    asset = data["assets"][0]
    assert asset["category"] == "Electronics"
    assert asset["status"] == "active"
  
  def test_get_assets_search_and_filter(self, client, sample_assets):
    """Test combining search and filter"""
    response = client.get("/api/assets/?search=monitor&category=Electronics")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 1
    assert len(data["assets"]) == 1
    asset = data["assets"][0]
    assert "Monitor" in asset["name"]
    assert asset["category"] == "Electronics"
  
  def test_get_assets_invalid_page(self, client, sample_assets):
    """Test invalid page number"""
    response = client.get("/api/assets/?page=0")
    
    assert response.status_code == 422
  
  def test_get_assets_invalid_page_size(self, client, sample_assets):
    """Test invalid page size"""
    response = client.get("/api/assets/?page_size=0")
    
    assert response.status_code == 422
  
  def test_get_assets_page_size_too_large(self, client, sample_assets):
    """Test page size exceeding maximum"""
    response = client.get("/api/assets/?page_size=101")
    
    assert response.status_code == 422
  
  def test_get_assets_empty_database(self, client, db_session):
    """Test getting assets from empty database"""
    response = client.get("/api/assets/")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["total"] == 0
    assert data["page"] == 1
    assert data["page_size"] == 20
    assert data["total_pages"] == 1
    assert len(data["assets"]) == 0

class TestGetAssetById:
  """Test GET /api/assets/{id} endpoint"""
  
  def test_get_asset_by_id_success(self, client, sample_assets):
    """Test getting asset by valid ID"""
    asset_id = sample_assets[0].id
    response = client.get(f"/api/assets/{asset_id}")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == asset_id
    assert data["name"] == "Laptop Dell XPS"
    assert data["category"] == "Electronics"
    assert data["serial_number"] == "DELL001"
    assert data["status"] == "active"
    assert "created_at" in data
    assert "updated_at" in data
  
  def test_get_asset_by_id_not_found(self, client, sample_assets):
    """Test getting asset with non-existent ID"""
    response = client.get("/api/assets/999")
    
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "error" in data["detail"]
    assert data["detail"]["error"]["code"] == "ASSET_NOT_FOUND"
  
  def test_get_asset_by_id_invalid_id(self, client, sample_assets):
    """Test getting asset with invalid ID format"""
    response = client.get("/api/assets/invalid")
    
    assert response.status_code == 422

class TestGetCategories:
  """Test GET /api/assets/categories endpoint"""
  
  def test_get_categories_success(self, client, sample_assets):
    """Test getting all categories"""
    response = client.get("/api/assets/categories")
    
    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    assert "Electronics" in data
    assert "Furniture" in data
    assert len(data) == 2
  
  def test_get_categories_empty_database(self, client, db_session):
    """Test getting categories from empty database"""
    response = client.get("/api/assets/categories")
    
    assert response.status_code == 200
    data = response.json()
    
    assert isinstance(data, list)
    assert len(data) == 0

class TestAssetRetrievalIntegration:
  """Integration tests for asset retrieval functionality"""
  
  def test_asset_retrieval_workflow(self, client, db_session):
    """Test complete asset retrieval workflow"""
    # Create an asset first
    asset_data = {
      "name": "Test Asset",
      "description": "Test description",
      "category": "Test Category",
      "serial_number": "TEST001",
      "purchase_date": "2023-01-01",
      "purchase_price": 100.00,
      "status": "active"
    }
    
    create_response = client.post("/api/assets/", json=asset_data)
    assert create_response.status_code == 201
    created_asset = create_response.json()
    asset_id = created_asset["id"]
    
    # Test getting all assets
    list_response = client.get("/api/assets/")
    assert list_response.status_code == 200
    list_data = list_response.json()
    assert list_data["total"] == 1
    assert len(list_data["assets"]) == 1
    
    # Test getting specific asset
    get_response = client.get(f"/api/assets/{asset_id}")
    assert get_response.status_code == 200
    get_data = get_response.json()
    assert get_data["id"] == asset_id
    assert get_data["name"] == asset_data["name"]
    
    # Test getting categories
    categories_response = client.get("/api/assets/categories")
    assert categories_response.status_code == 200
    categories_data = categories_response.json()
    assert "Test Category" in categories_data
    
    # Test search functionality
    search_response = client.get("/api/assets/?search=Test")
    assert search_response.status_code == 200
    search_data = search_response.json()
    assert search_data["total"] == 1
    assert search_data["assets"][0]["name"] == asset_data["name"]