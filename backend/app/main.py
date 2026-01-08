from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware import exception_handler
from .exceptions import AssetManagementException
from .routers import assets

app = FastAPI(
  title="Asset Management API",
  description="API for managing organizational assets",
  version="1.0.0"
)

# Configure CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],  # React dev server
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Add global exception handler
app.add_exception_handler(Exception, exception_handler)

# Include routers
app.include_router(assets.router)

@app.get("/")
async def root():
  return {"message": "Asset Management API"}

@app.get("/health")
async def health_check():
  return {"status": "healthy"}