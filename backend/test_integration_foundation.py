import pytest
from datetime import date
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.connection import Base
from app.models.asset import Asset, AssetStatus
from app.schemas.asset import AssetCreate, AssetUpdate
from app.repositories.asset_repository import AssetRepository
from app.services.asset_service import AssetService
from app.exceptions import AssetNotFoundException, DuplicateSerialNumberException

# Test database URL (using in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite:///./test.db"

@pytest.fixture
def test_db():
  """Create a test database session"""
  engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
  Base.metadata.create_all(bind=engine)
  
  TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
  db = TestingSessionLocal()
  
  try:
    yield db
  finally:
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_asset_repository_crud(test_db):
  """Test AssetRepository CRUD operations"""
  repository = AssetRepository(test_db)
  
  # Test create
  asset_data = AssetCreate(
    name="Test Laptop",
    description="A test laptop",
    category="Electronics",
    serial_number="TEST123",
    purchase_date=date(2024, 1, 15),
    purchase_price=Decimal("999.99"),
    status=AssetStatus.ACTIVE
  )
  
  created_asset = repository.create(asset_data)
  assert created_asset.id is not None
  assert created_asset.name == "Test Laptop"
  assert created_asset.serial_number == "TEST123"
  
  # Test get by id
  retrieved_asset = repository.get_by_id(created_asset.id)
  assert retrieved_asset.id == created_asset.id
  assert retrieved_asset.name == "Test Laptop"
  
  # Test get all
  assets, total = repository.get_all()
  assert total == 1
  assert len(assets) == 1
  assert assets[0].id == created_asset.id
  
  # Test update
  update_data = AssetUpdate(
    name="Updated Laptop",
    description="An updated laptop",
    category="Electronics",
    serial_number="TEST123",
    purchase_date=date(2024, 1, 15),
    purchase_price=Decimal("1199.99"),
    status=AssetStatus.MAINTENANCE
  )
  
  updated_asset = repository.update(created_asset.id, update_data)
  assert updated_asset.name == "Updated Laptop"
  assert updated_asset.purchase_price == Decimal("1199.99")
  assert updated_asset.status == AssetStatus.MAINTENANCE
  
  # Test delete
  result = repository.delete(created_asset.id)
  assert result is True
  
  # Verify deletion
  with pytest.raises(AssetNotFoundException):
    repository.get_by_id(created_asset.id)

def test_duplicate_serial_number(test_db):
  """Test duplicate serial number handling"""
  repository = AssetRepository(test_db)
  
  # Create first asset
  asset_data1 = AssetCreate(
    name="First Asset",
    description="First asset",
    category="Electronics",
    serial_number="DUPLICATE123",
    purchase_date=date(2024, 1, 15),
    purchase_price=Decimal("999.99"),
    status=AssetStatus.ACTIVE
  )
  
  repository.create(asset_data1)
  
  # Try to create second asset with same serial number
  asset_data2 = AssetCreate(
    name="Second Asset",
    description="Second asset",
    category="Electronics",
    serial_number="DUPLICATE123",
    purchase_date=date(2024, 1, 16),
    purchase_price=Decimal("1099.99"),
    status=AssetStatus.ACTIVE
  )
  
  with pytest.raises(DuplicateSerialNumberException):
    repository.create(asset_data2)

def test_asset_service(test_db):
  """Test AssetService functionality"""
  service = AssetService(test_db)
  
  # Test create asset
  asset_data = AssetCreate(
    name="Service Test Laptop",
    description="A laptop for service testing",
    category="Electronics",
    serial_number="SERVICE123",
    purchase_date=date(2024, 1, 15),
    purchase_price=Decimal("1299.99"),
    status=AssetStatus.ACTIVE
  )
  
  created_asset = service.create_asset(asset_data)
  assert created_asset.id is not None
  assert created_asset.name == "Service Test Laptop"
  
  # Test get asset
  retrieved_asset = service.get_asset(created_asset.id)
  assert retrieved_asset.id == created_asset.id
  
  # Test get assets with pagination
  assets_response = service.get_assets(page=1, page_size=10)
  assert assets_response.total == 1
  assert len(assets_response.assets) == 1
  assert assets_response.page == 1
  assert assets_response.total_pages == 1

if __name__ == "__main__":
  pytest.main([__file__, "-v"])