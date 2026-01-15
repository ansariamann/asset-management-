from sqlalchemy import Column, Integer, String, Text, Date, Numeric, DateTime, Enum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from ..database.connection import Base

class AssetStatus(enum.Enum):
  ACTIVE = "active"
  INACTIVE = "inactive"
  MAINTENANCE = "maintenance"
  DISPOSED = "disposed"

class Asset(Base):
  __tablename__ = "assets"

  id = Column(Integer, primary_key=True, index=True)
  name = Column(String(255), nullable=False)
  description = Column(Text)
  category = Column(String(100), nullable=True)
  serial_number = Column(String(100), unique=True, nullable=False, index=True)
  purchase_date = Column(Date, nullable=False)
  purchase_price = Column(Numeric(10, 2), nullable=False)
  status = Column(Enum(AssetStatus), nullable=False, index=True)
  created_at = Column(DateTime, default=func.now())
  updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

  def __repr__(self):
    return f"<Asset(id={self.id}, name='{self.name}', serial_number='{self.serial_number}')>"