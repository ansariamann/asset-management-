"""Make category optional

Revision ID: 002
Revises: 001
Create Date: 2026-01-13 22:54:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make category column nullable
    op.alter_column('assets', 'category',
                    existing_type=sa.String(length=100),
                    nullable=True)


def downgrade() -> None:
    # Revert category column to not nullable
    op.alter_column('assets', 'category',
                    existing_type=sa.String(length=100),
                    nullable=False)
