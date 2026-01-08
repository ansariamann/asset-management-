# Database Setup Guide

## Overview

This document describes the database layer implementation for the Asset Management System.

## Database Schema

### Assets Table

The `assets` table stores all asset information with the following structure:

```sql
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance', 'disposed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

The following indexes are created for optimal query performance:

- `ix_assets_id` - Primary key index
- `ix_assets_serial_number` - Unique index for serial numbers
- `ix_assets_status` - Index for status filtering
- `idx_assets_category` - Index for category filtering
- `idx_assets_name` - Index for name searching

## Setup Instructions

### 1. Install PostgreSQL

Ensure PostgreSQL 13+ is installed and running on your system.

### 2. Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE asset_management;

# Create user (optional)
CREATE USER asset_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE asset_management TO asset_user;
```

### 3. Configure Environment

Copy the environment template:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/asset_management
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run Migrations

```bash
# Initialize database (creates tables)
python -c "from app.database import init_database; init_database()"

# Or use Alembic for migrations
python -m alembic upgrade head
```

### 6. Verify Setup

```bash
python test_db_setup.py
```

## Database Models

### Asset Model

The `Asset` SQLAlchemy model represents assets in the system:

```python
class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), nullable=False)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    purchase_date = Column(Date, nullable=False)
    purchase_price = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(AssetStatus), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```

### Asset Status Enum

```python
class AssetStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    DISPOSED = "disposed"
```

## Database Connection

The database connection is managed through SQLAlchemy:

- **Engine**: Created with connection pooling
- **SessionLocal**: Session factory for database operations
- **Base**: Declarative base for all models
- **get_db()**: Dependency function for FastAPI endpoints

## Migration Management

Migrations are handled using Alembic:

- Configuration: `alembic.ini`
- Environment: `alembic/env.py`
- Versions: `alembic/versions/`

### Common Migration Commands

```bash
# Create new migration
python -m alembic revision --autogenerate -m "Description"

# Apply migrations
python -m alembic upgrade head

# Rollback migration
python -m alembic downgrade -1

# Show current revision
python -m alembic current

# Show migration history
python -m alembic history
```

## Utilities

### Database Utilities

- `test_connection()` - Test database connectivity
- `get_database_info()` - Get database version and info
- `check_table_exists()` - Check if table exists
- `init_database()` - Initialize database and create tables

### Testing

Run the database setup test:

```bash
python test_db_setup.py
```

This will verify:

- Database connection
- Table existence
- Model validation
- Configuration correctness

## Troubleshooting

### Connection Issues

1. Ensure PostgreSQL is running
2. Check database URL in `.env` file
3. Verify database and user exist
4. Check firewall/network settings

### Migration Issues

1. Ensure database is accessible
2. Check Alembic configuration
3. Verify model imports in `env.py`
4. Check for conflicting migrations

### Performance Issues

1. Verify indexes are created
2. Check query patterns
3. Monitor connection pool usage
4. Consider query optimization
