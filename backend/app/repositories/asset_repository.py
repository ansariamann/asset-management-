from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Tuple
from ..models.asset import Asset, AssetStatus
from ..schemas.asset import AssetCreate, AssetUpdate
from ..exceptions import AssetNotFoundException, DuplicateSerialNumberException, DatabaseException

class AssetRepository:
  def __init__(self, db: Session):
    self.db = db

  def create(self, asset_data: AssetCreate) -> Asset:
    """Create a new asset"""
    try:
      # Check for duplicate serial number
      existing_asset = self.db.query(Asset).filter(
        Asset.serial_number == asset_data.serial_number
      ).first()
      
      if existing_asset:
        raise DuplicateSerialNumberException(asset_data.serial_number)
      
      # Create new asset
      db_asset = Asset(**asset_data.model_dump())
      self.db.add(db_asset)
      self.db.commit()
      self.db.refresh(db_asset)
      return db_asset
      
    except DuplicateSerialNumberException:
      self.db.rollback()
      raise
    except Exception as e:
      self.db.rollback()
      raise DatabaseException(f"Failed to create asset: {str(e)}")

  def get_by_id(self, asset_id: int) -> Asset:
    """Get asset by ID"""
    asset = self.db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
      raise AssetNotFoundException(asset_id)
    return asset

  def get_all(
    self, 
    skip: int = 0, 
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[AssetStatus] = None
  ) -> Tuple[List[Asset], int]:
    """Get all assets with pagination and filtering"""
    try:
      query = self.db.query(Asset)
      
      # Apply filters
      filters = []
      
      if search:
        search_filter = or_(
          Asset.name.ilike(f"%{search}%"),
          Asset.description.ilike(f"%{search}%"),
          Asset.serial_number.ilike(f"%{search}%")
        )
        filters.append(search_filter)
      
      if category:
        filters.append(Asset.category == category)
      
      if status:
        filters.append(Asset.status == status)
      
      if filters:
        query = query.filter(and_(*filters))
      
      # Get total count
      total = query.count()
      
      # Apply pagination and ordering
      assets = query.order_by(Asset.created_at.desc()).offset(skip).limit(limit).all()
      
      return assets, total
      
    except Exception as e:
      raise DatabaseException(f"Failed to retrieve assets: {str(e)}")

  def update(self, asset_id: int, asset_data: AssetUpdate) -> Asset:
    """Update an existing asset"""
    try:
      # Get existing asset
      db_asset = self.get_by_id(asset_id)
      
      # Check for duplicate serial number (excluding current asset)
      if asset_data.serial_number != db_asset.serial_number:
        existing_asset = self.db.query(Asset).filter(
          and_(
            Asset.serial_number == asset_data.serial_number,
            Asset.id != asset_id
          )
        ).first()
        
        if existing_asset:
          raise DuplicateSerialNumberException(asset_data.serial_number)
      
      # Update asset fields
      update_data = asset_data.model_dump(exclude_unset=True)
      for field, value in update_data.items():
        setattr(db_asset, field, value)
      
      self.db.commit()
      self.db.refresh(db_asset)
      return db_asset
      
    except (AssetNotFoundException, DuplicateSerialNumberException):
      self.db.rollback()
      raise
    except Exception as e:
      self.db.rollback()
      raise DatabaseException(f"Failed to update asset: {str(e)}")

  def delete(self, asset_id: int) -> bool:
    """Delete an asset"""
    try:
      db_asset = self.get_by_id(asset_id)
      self.db.delete(db_asset)
      self.db.commit()
      return True
      
    except AssetNotFoundException:
      raise
    except Exception as e:
      self.db.rollback()
      raise DatabaseException(f"Failed to delete asset: {str(e)}")

  def get_categories(self) -> List[str]:
    """Get all unique categories"""
    try:
      categories = self.db.query(Asset.category).distinct().all()
      return [category[0] for category in categories if category[0]]
    except Exception as e:
      raise DatabaseException(f"Failed to retrieve categories: {str(e)}")

  def exists_by_serial_number(self, serial_number: str, exclude_id: Optional[int] = None) -> bool:
    """Check if asset with serial number exists"""
    try:
      query = self.db.query(Asset).filter(Asset.serial_number == serial_number)
      if exclude_id:
        query = query.filter(Asset.id != exclude_id)
      return query.first() is not None
    except Exception as e:
      raise DatabaseException(f"Failed to check serial number existence: {str(e)}")