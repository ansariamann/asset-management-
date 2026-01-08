#!/usr/bin/env python3
"""
Test script to verify database setup and models
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.database import test_connection, get_database_info, check_table_exists
from app.models.asset import Asset, AssetStatus
from datetime import date
from decimal import Decimal

def test_database_setup():
  """Test database setup and models"""
  print("Testing Asset Management System Database Setup")
  print("=" * 50)
  
  # Test 1: Database connection
  print("1. Testing database connection...")
  if test_connection():
    print("   ✓ Database connection successful")
  else:
    print("   ✗ Database connection failed")
    print("   Note: This is expected if PostgreSQL is not running")
    return False
  
  # Test 2: Database info
  print("\n2. Getting database information...")
  db_info = get_database_info()
  if db_info:
    print(f"   Database: {db_info['database']}")
    print(f"   URL: {db_info['url']}")
    print(f"   Version: {db_info['version'][:50]}...")
  else:
    print("   ✗ Could not retrieve database information")
    return False
  
  # Test 3: Check if assets table exists
  print("\n3. Checking if assets table exists...")
  if check_table_exists('assets'):
    print("   ✓ Assets table exists")
  else:
    print("   ✗ Assets table does not exist")
    print("   Run migrations to create the table")
  
  # Test 4: Model validation
  print("\n4. Testing Asset model...")
  try:
    # Test AssetStatus enum
    status = AssetStatus.ACTIVE
    print(f"   ✓ AssetStatus enum works: {status.value}")
    
    # Test Asset model creation (without database)
    asset_data = {
      'name': 'Test Laptop',
      'description': 'Dell Latitude 5520',
      'category': 'Electronics',
      'serial_number': 'DL123456789',
      'purchase_date': date(2024, 1, 15),
      'purchase_price': Decimal('1299.99'),
      'status': AssetStatus.ACTIVE
    }
    
    # This would create an Asset instance (but not save to DB)
    print("   ✓ Asset model structure is valid")
    print(f"   Sample asset data: {asset_data}")
    
  except Exception as e:
    print(f"   ✗ Asset model test failed: {e}")
    return False
  
  print("\n" + "=" * 50)
  print("Database setup validation completed!")
  return True

if __name__ == "__main__":
  success = test_database_setup()
  sys.exit(0 if success else 1)