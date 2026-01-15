"""
Script to update the database schema to make category column nullable.
This script directly modifies the SQLite database.
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'asset_management.db')

print(f"Updating database at: {db_path}")

try:
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # SQLite doesn't support ALTER COLUMN directly, so we need to:
    # 1. Create a new table with the updated schema
    # 2. Copy data from old table
    # 3. Drop old table
    # 4. Rename new table
    
    print("Creating new assets table with nullable category...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assets_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            serial_number VARCHAR(100) UNIQUE NOT NULL,
            purchase_date DATE NOT NULL,
            purchase_price DECIMAL(10, 2) NOT NULL,
            status VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    print("Copying data from old table...")
    cursor.execute("""
        INSERT INTO assets_new (id, name, description, category, serial_number, 
                                purchase_date, purchase_price, status, created_at, updated_at)
        SELECT id, name, description, category, serial_number, 
               purchase_date, purchase_price, status, created_at, updated_at
        FROM assets
    """)
    
    print("Dropping old table...")
    cursor.execute("DROP TABLE assets")
    
    print("Renaming new table...")
    cursor.execute("ALTER TABLE assets_new RENAME TO assets")
    
    print("Creating indexes...")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_assets_id ON assets (id)")
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_assets_serial_number ON assets (serial_number)")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_assets_status ON assets (status)")
    
    # Commit the changes
    conn.commit()
    print("✅ Database schema updated successfully!")
    print("Category column is now optional (nullable).")
    
except sqlite3.Error as e:
    print(f"❌ Error updating database: {e}")
    conn.rollback()
finally:
    conn.close()
