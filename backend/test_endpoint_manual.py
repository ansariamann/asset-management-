#!/usr/bin/env python3
"""
Manual test script for asset creation endpoint
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_asset_creation_endpoint():
    """Test the asset creation endpoint manually"""
    client = TestClient(app)
    
    # Test data
    asset_data = {
        "name": "Manual Test Laptop",
        "description": "A laptop for manual testing",
        "category": "Electronics",
        "serial_number": "MTL001",
        "purchase_date": "2024-01-15",
        "purchase_price": 1299.99,
        "status": "active"
    }
    
    print("Testing asset creation endpoint...")
    print(f"POST /api/assets/ with data: {asset_data}")
    
    try:
        response = client.post("/api/assets/", json=asset_data)
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Asset creation endpoint working correctly!")
        else:
            print("❌ Asset creation endpoint returned unexpected status")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {e}")

if __name__ == "__main__":
    test_asset_creation_endpoint()