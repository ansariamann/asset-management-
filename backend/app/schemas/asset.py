from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from ..models.asset import AssetStatus

class AssetBase(BaseModel):
  name: str = Field(..., min_length=1, max_length=255)
  description: Optional[str] = None
  category: Optional[str] = Field(None, min_length=1, max_length=100)
  serial_number: str = Field(..., min_length=1, max_length=100)
  purchase_date: date
  purchase_price: Decimal = Field(..., gt=0)
  status: AssetStatus

class AssetCreate(AssetBase):
  pass

class AssetUpdate(BaseModel):
  name: Optional[str] = Field(None, min_length=1, max_length=255)
  description: Optional[str] = None
  category: Optional[str] = Field(None, min_length=1, max_length=100)
  serial_number: Optional[str] = Field(None, min_length=1, max_length=100)
  purchase_date: Optional[date] = None
  purchase_price: Optional[Decimal] = Field(None, gt=0)
  status: Optional[AssetStatus] = None

class AssetResponse(AssetBase):
  model_config = ConfigDict(from_attributes=True)
  
  id: int
  created_at: datetime
  updated_at: datetime

class AssetListResponse(BaseModel):
  assets: list[AssetResponse]
  total: int
  page: int
  page_size: int
  total_pages: int