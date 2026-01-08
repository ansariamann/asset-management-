#!/usr/bin/env python3
"""
Database initialization script
Creates all tables and sets up the database schema
"""
from datetime import date
from app.database.connection import engine, Base, SessionLocal
from app.models.asset import Asset, AssetStatus

def seed_database():
    """Seed the database with initial data"""
    db = SessionLocal()
    try:
        # Check if assets already exist
        if db.query(Asset).count() == 0:
            print("Seeding database with initial data...")
            assets_to_create = [
                Asset(
                    name="Laptop 1",
                    description="A powerful laptop",
                    category="Electronics",
                    serial_number="LP12345",
                    purchase_date=date(2023, 1, 15),
                    purchase_price=1200.00,
                    status=AssetStatus.ACTIVE,
                ),
                Asset(
                    name="Office Chair",
                    description="Ergonomic office chair",
                    category="Furniture",
                    serial_number="OC54321",
                    purchase_date=date(2022, 5, 20),
                    purchase_price=250.00,
                    status=AssetStatus.ACTIVE,
                ),
                Asset(
                    name="Printer",
                    description="Multifunction printer",
                    category="Office Supplies",
                    serial_number="PR98765",
                    purchase_date=date(2023, 3, 10),
                    purchase_price=450.00,
                    status=AssetStatus.INACTIVE,
                ),
                Asset(
                    name="Conference Table",
                    description="Large meeting table",
                    category="Furniture",
                    serial_number="CT56789",
                    purchase_date=date(2021, 11, 5),
                    purchase_price=800.00,
                    status=AssetStatus.ACTIVE,
                ),
            ]
            db.add_all(assets_to_create)
            db.commit()
            print("Database seeded successfully!")
        else:
            print("Database already seeded.")
    finally:
        db.close()


def init_database():
  """Initialize the database by creating all tables"""
  print("Dropping all database tables...")
  Base.metadata.drop_all(bind=engine)
  print("Creating database tables...")
  Base.metadata.create_all(bind=engine)
  print("Database tables created successfully!")

if __name__ == "__main__":
  init_database()
  seed_database()