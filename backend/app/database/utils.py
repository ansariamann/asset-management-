"""
Database utility functions
"""
from sqlalchemy import text
from .connection import engine, SessionLocal
import logging

logger = logging.getLogger(__name__)

def test_connection():
  """Test database connection"""
  try:
    with engine.connect() as conn:
      result = conn.execute(text("SELECT 1"))
      return result.fetchone() is not None
  except Exception as e:
    logger.error(f"Database connection test failed: {e}")
    return False

def get_database_info():
  """Get database information"""
  try:
    with engine.connect() as conn:
      # Get database version
      version_result = conn.execute(text("SELECT version()"))
      version = version_result.fetchone()[0]
      
      # Get current database name
      db_result = conn.execute(text("SELECT current_database()"))
      db_name = db_result.fetchone()[0]
      
      return {
        "version": version,
        "database": db_name,
        "url": str(engine.url).replace(str(engine.url.password), "***")
      }
  except Exception as e:
    logger.error(f"Failed to get database info: {e}")
    return None

def check_table_exists(table_name: str) -> bool:
  """Check if a table exists in the database"""
  try:
    with engine.connect() as conn:
      result = conn.execute(
        text("""
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = :table_name
          )
        """),
        {"table_name": table_name}
      )
      return result.fetchone()[0]
  except Exception as e:
    logger.error(f"Error checking table existence: {e}")
    return False