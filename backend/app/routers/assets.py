from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database.connection import get_db
from ..services.asset_service import AssetService
from ..schemas.asset import AssetCreate, AssetUpdate, AssetResponse, AssetListResponse
from ..models.asset import AssetStatus
from ..exceptions import (
  AssetNotFoundException,
  DuplicateSerialNumberException,
  ValidationException,
  DatabaseException,
  create_http_exception
)

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("/", response_model=AssetListResponse)
async def get_assets(
  page: int = Query(1, ge=1, description="Page number (starts from 1)"),
  page_size: int = Query(20, ge=1, le=100, description="Number of items per page (1-100)"),
  search: Optional[str] = Query(None, description="Search by name, description, or serial number"),
  category: Optional[str] = Query(None, description="Filter by category"),
  status: Optional[AssetStatus] = Query(None, description="Filter by status"),
  db: Session = Depends(get_db)
):
  """
  Get paginated list of assets with optional filtering
  
  - **page**: Page number (default: 1)
  - **page_size**: Items per page (default: 20, max: 100)
  - **search**: Search text to filter by name, description, or serial number
  - **category**: Filter assets by category
  - **status**: Filter assets by status (active, inactive, maintenance, disposed)
  """
  try:
    service = AssetService(db)
    return service.get_assets(
      page=page,
      page_size=page_size,
      search=search,
      category=category,
      status=status
    )
  except ValidationException as e:
    raise create_http_exception(e, status.HTTP_422_UNPROCESSABLE_ENTITY)
  except DatabaseException as e:
    raise create_http_exception(e, status.HTTP_500_INTERNAL_SERVER_ERROR)
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )

@router.get("/categories", response_model=List[str])
async def get_categories(db: Session = Depends(get_db)):
  """
  Get all available asset categories
  """
  try:
    service = AssetService(db)
    return service.get_categories()
  except DatabaseException as e:
    raise create_http_exception(e, status.HTTP_500_INTERNAL_SERVER_ERROR)
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )

@router.get("/statuses", response_model=List[str])
async def get_statuses():
  """
  Get all available asset statuses
  """
  try:
    return [status.value for status in AssetStatus]
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )

@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
  asset_id: int,
  db: Session = Depends(get_db)
):
  """
  Get a specific asset by ID
  
  - **asset_id**: The ID of the asset to retrieve
  """
  try:
    service = AssetService(db)
    return service.get_asset(asset_id)
  except AssetNotFoundException as e:
    raise create_http_exception(e, status.HTTP_404_NOT_FOUND)
  except DatabaseException as e:
    raise create_http_exception(e, status.HTTP_500_INTERNAL_SERVER_ERROR)
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )

@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
  asset_data: AssetCreate,
  db: Session = Depends(get_db)
):
  """
  Create a new asset
  
  - **name**: Asset name (required, 1-255 characters)
  - **description**: Asset description (optional)
  - **category**: Asset category (required, 1-100 characters)
  - **serial_number**: Unique serial number (required, 1-100 characters)
  - **purchase_date**: Date of purchase (required)
  - **purchase_price**: Purchase price (required, must be positive)
  - **status**: Asset status (required: active, inactive, maintenance, disposed)
  """
  try:
    service = AssetService(db)
    return service.create_asset(asset_data)
  except DuplicateSerialNumberException as e:
    raise create_http_exception(e, status.HTTP_409_CONFLICT)
  except ValidationException as e:
    raise create_http_exception(e, status.HTTP_422_UNPROCESSABLE_ENTITY)
  except DatabaseException as e:
    raise create_http_exception(e, status.HTTP_500_INTERNAL_SERVER_ERROR)
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )

@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
  asset_id: int,
  asset_data: AssetUpdate,
  db: Session = Depends(get_db)
):
  """
  Update an existing asset
  
  - **asset_id**: The ID of the asset to update
  - **name**: Asset name (required, 1-255 characters)
  - **description**: Asset description (optional)
  - **category**: Asset category (required, 1-100 characters)
  - **serial_number**: Unique serial number (required, 1-100 characters)
  - **purchase_date**: Date of purchase (required)
  - **purchase_price**: Purchase price (required, must be positive)
  - **status**: Asset status (required: active, inactive, maintenance, disposed)
  """
  try:
    service = AssetService(db)
    return service.update_asset(asset_id, asset_data)
  except AssetNotFoundException as e:
    raise create_http_exception(e, status.HTTP_404_NOT_FOUND)
  except DuplicateSerialNumberException as e:
    raise create_http_exception(e, status.HTTP_409_CONFLICT)
  except ValidationException as e:
    raise create_http_exception(e, status.HTTP_422_UNPROCESSABLE_ENTITY)
  except DatabaseException as e:
    raise create_http_exception(e, status.HTTP_500_INTERNAL_SERVER_ERROR)
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
  asset_id: int,
  db: Session = Depends(get_db)
):
  """
  Delete an asset
  
  - **asset_id**: The ID of the asset to delete
  """
  try:
    service = AssetService(db)
    service.delete_asset(asset_id)
  except AssetNotFoundException as e:
    raise create_http_exception(e, status.HTTP_404_NOT_FOUND)
  except DatabaseException as e:
    raise create_http_exception(e, status.HTTP_500_INTERNAL_SERVER_ERROR)
  except Exception as e:
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail={
        "error": {
          "code": "INTERNAL_ERROR",
          "message": "An unexpected error occurred",
          "details": {}
        }
      }
    )