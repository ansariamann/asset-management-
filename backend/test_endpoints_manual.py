#!/usr/bin/env python3
"""
Manual test script to verify utility endpoints work correctly
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app

def test_utility_endpoints():
  """Test utility endpoints manually"""
  print("Testing Asset Management System Utility Endpoints")
  print("=" * 55)
  
  client = TestClient(app)
  
  # Test 1: Categories endpoint
  print("1. Testing GET /api/assets/categories...")
  try:
    response = client.get("/api/assets/categories")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
      data = response.json()
      print(f"   Response: {data}")
      print("   ✓ Categories endpoint working")
    else:
      print(f"   ✗ Categories endpoint failed: {response.text}")
  except Exception as e:
    print(f"   ✗ Categories endpoint error: {e}")
  
  # Test 2: Statuses endpoint
  print("\n2. Testing GET /api/assets/statuses...")
  try:
    response = client.get("/api/assets/statuses")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
      data = response.json()
      print(f"   Response: {data}")
      expected_statuses = ["active", "inactive", "maintenance", "disposed"]
      if all(status in data for status in expected_statuses):
        print("   ✓ Statuses endpoint working correctly")
      else:
        print("   ✗ Statuses endpoint missing expected values")
    else:
      print(f"   ✗ Statuses endpoint failed: {response.text}")
  except Exception as e:
    print(f"   ✗ Statuses endpoint error: {e}")
  
  print("\n" + "=" * 55)
  print("Utility endpoints test completed!")

if __name__ == "__main__":
  test_utility_endpoints()