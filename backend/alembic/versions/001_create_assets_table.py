"""Create assets table

Revision ID: 001
Revises: 
Create Date: 2025-01-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create assets table
    op.create_table('assets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('serial_number', sa.String(length=100), nullable=False),
        sa.Column('purchase_date', sa.Date(), nullable=False),
        sa.Column('purchase_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status', sa.Enum('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISPOSED', name='assetstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_assets_id', 'assets', ['id'], unique=False)
    op.create_index('ix_assets_serial_number', 'assets', ['serial_number'], unique=True)
    op.create_index('ix_assets_status', 'assets', ['status'], unique=False)
    op.create_index('idx_assets_category', 'assets', ['category'], unique=False)
    op.create_index('idx_assets_name', 'assets', ['name'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_assets_name', table_name='assets')
    op.drop_index('idx_assets_category', table_name='assets')
    op.drop_index('ix_assets_status', table_name='assets')
    op.drop_index('ix_assets_serial_number', table_name='assets')
    op.drop_index('ix_assets_id', table_name='assets')
    
    # Drop table
    op.drop_table('assets')
    
    # Drop enum type
    op.execute('DROP TYPE IF EXISTS assetstatus')