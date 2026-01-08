from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.connection import get_db, Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./debug.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
  try:
    db = TestingSessionLocal()
    yield db
  finally:
    db.close()

app.dependency_overrides[get_db] = override_get_db

# Create tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# Test 404 response
print("Testing 404 response:")
response = client.delete("/api/assets/99999")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")

# Test invalid ID format
print("\nTesting invalid ID format:")
response = client.delete("/api/assets/invalid_id")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")