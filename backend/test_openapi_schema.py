#!/usr/bin/env python3
"""
Test script to verify OpenAPI schema includes the asset creation endpoint
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_openapi_schema():
    """Test that the OpenAPI schema includes our asset creation endpoint"""
    client = TestClient(app)
    
    print("Testing OpenAPI schema...")
    
    try:
        response = client.get("/openapi.json")
        print(f"OpenAPI schema status: {response.status_code}")
        
        if response.status_code == 200:
            schema = response.json()
            
            # Check if our endpoint is in the schema
            paths = schema.get("paths", {})
            asset_post = paths.get("/api/assets/", {}).get("post", {})
            
            if asset_post:
                print("✅ POST /api/assets/ endpoint found in OpenAPI schema")
                print(f"Summary: {asset_post.get('summary', 'N/A')}")
                print(f"Tags: {asset_post.get('tags', [])}")
                
                # Check request body schema
                request_body = asset_post.get("requestBody", {})
                if request_body:
                    print("✅ Request body schema defined")
                
                # Check responses
                responses = asset_post.get("responses", {})
                if "201" in responses:
                    print("✅ 201 Created response defined")
                if "409" in responses:
                    print("✅ 409 Conflict response defined")
                if "422" in responses:
                    print("✅ 422 Validation Error response defined")
                    
            else:
                print("❌ POST /api/assets/ endpoint not found in OpenAPI schema")
                
        else:
            print("❌ Failed to get OpenAPI schema")
            
    except Exception as e:
        print(f"❌ Error testing OpenAPI schema: {e}")

if __name__ == "__main__":
    test_openapi_schema()