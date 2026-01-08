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
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_utility_endpoints.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
  try:
    db = TestingSessionLocal()
    yield db
  finally:
    db.close()

app.dependency_overrides[get_db] = override_get_db

class TestUtilityEndpoints:
  """Test utility endpoints for categories and statuses"""

  def test_get_categories_success(self, client, sample_assets):
    """Test getting all categories"""
    response = client.get("/api/assets/categories")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should return unique categories from sample assets
    assert isinstance(data, list)
    assert len(data) == 2
    assert "Electronics" in data
    assert "Furniture" in data

  def test_get_categories_empty_database(self, client, db_session):
    """Test getting categories from empty database"""
    response = client.get("/api/assets/categories")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

  def test_get_statuses_success(self, client):
    """Test getting all available statuses"""
    response = client.get("/api/assets/statuses")
    
    assert response.status_code == 200
    data = response.json()
    
    # Should return all enum values
    assert isinstance(data, list)
    assert len(data) == 4
    assert "active" in data
    assert "inactive" in data
    assert "maintenance" in data
    assert "disposed" in data

  def test_get_statuses_no_database_dependency(self, client):
    """Test that statuses endpoint doesn't require database"""
    # This endpoint should work even without database connection
    # since it just returns enum values
    response = client.get("/api/assets/statuses")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4

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
  """Create sample assets with different categories"""
  assets_data = [
    {
      "name": "Laptop",
      "description": "Dell XPS laptop",
      "category": "Electronics",
      "serial_number": "LAPTOP001",
      "purchase_date": date(2024, 1, 15),
      "purchase_price": Decimal("1299.99"),
      "status": AssetStatus.ACTIVE
    },
    {
      "name": "Desk",
      "description": "Standing desk",
      "category": "Furniture",
      "serial_number": "DESK001",
      "purchase_date": date(2024, 2, 10),
      "purchase_price": Decimal("599.99"),
      "status": AssetStatus.INACTIVE
    },
    {
      "name": "Monitor",
      "description": "4K monitor",
      "category": "Electronics",
      "serial_number": "MON001",
      "purchase_date": date(2024, 3, 5),
      "purchase_price": Decimal("399.99"),
      "status": AssetStatus.MAINTENANCE
    }
  ]
  
  assets = []
  for asset_data in assets_data:
    db_asset = Asset(**asset_data)
    db_session.add(db_asset)
    assets.append(db_asset)
  
  db_session.commit()
  return assets