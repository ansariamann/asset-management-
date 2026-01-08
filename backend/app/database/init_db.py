"""
Database initialization script
"""
from sqlalchemy import create_engine, text
from .connection import Base, DATABASE_URL
import logging

logger = logging.getLogger(__name__)

def create_database():
  """Create the database if it doesn't exist"""
  try:
    # Extract database name from URL
    db_name = DATABASE_URL.split('/')[-1]
    base_url = DATABASE_URL.rsplit('/', 1)[0]
    
    # Connect to postgres database to create our database
    engine = create_engine(f"{base_url}/postgres")
    
    with engine.connect() as conn:
      # Set autocommit mode
      conn.execute(text("COMMIT"))
      
      # Check if database exists
      result = conn.execute(
        text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
        {"db_name": db_name}
      )
      
      if not result.fetchone():
        # Create database
        conn.execute(text(f"CREATE DATABASE {db_name}"))
        logger.info(f"Database {db_name} created successfully")
      else:
        logger.info(f"Database {db_name} already exists")
        
  except Exception as e:
    logger.error(f"Error creating database: {e}")
    raise

def create_tables():
  """Create all tables"""
  try:
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully")
  except Exception as e:
    logger.error(f"Error creating tables: {e}")
    raise

def init_database():
  """Initialize the database and create tables"""
  try:
    create_database()
    create_tables()
    logger.info("Database initialization completed successfully")
  except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    raise

if __name__ == "__main__":
  logging.basicConfig(level=logging.INFO)
  init_database()