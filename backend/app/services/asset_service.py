from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from ..repositories.asset_repository import AssetRepository
from ..schemas.asset import AssetCreate, AssetUpdate, AssetResponse, AssetListResponse
from ..models.asset import Asset, AssetStatus
import math

class AssetService:
  def __init__(self, db: Session):
    self.repository = AssetRepository(db)

  def create_asset(self, asset_data: AssetCreate) -> AssetResponse:
    """Create a new asset"""
    asset = self.repository.create(asset_data)
    return AssetResponse.model_validate(asset)

  def get_asset(self, asset_id: int) -> AssetResponse:
    """Get asset by ID"""
    asset = self.repository.get_by_id(asset_id)
    return AssetResponse.model_validate(asset)

  def get_assets(
    self,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[AssetStatus] = None
  ) -> AssetListResponse:
    """Get paginated list of assets with filtering"""
    # Calculate skip value for pagination
    skip = (page - 1) * page_size
    
    # Get assets and total count
    assets, total = self.repository.get_all(
      skip=skip,
      limit=page_size,
      search=search,
      category=category,
      status=status
    )
    
    # Convert to response models
    asset_responses = [AssetResponse.model_validate(asset) for asset in assets]
    
    # Calculate total pages
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return AssetListResponse(
      assets=asset_responses,
      total=total,
      page=page,
      page_size=page_size,
      total_pages=total_pages
    )

  def update_asset(self, asset_id: int, asset_data: AssetUpdate) -> AssetResponse:
    """Update an existing asset"""
    asset = self.repository.update(asset_id, asset_data)
    return AssetResponse.model_validate(asset)

  def delete_asset(self, asset_id: int) -> bool:
    """Delete an asset"""
    return self.repository.delete(asset_id)

  def get_categories(self) -> List[str]:
    """Get all unique categories"""
    return self.repository.get_categories()

  def check_serial_number_exists(self, serial_number: str, exclude_id: Optional[int] = None) -> bool:
    """Check if serial number already exists"""
    return self.repository.exists_by_serial_number(serial_number, exclude_id)