"""update_uploaded_videos_metadata

Revision ID: e87981ce6e5e
Revises: e080d60f80e4
Create Date: 2026-06-22 14:29:56.264067

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e87981ce6e5e'
down_revision: Union[str, Sequence[str], None] = 'e080d60f80e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename existing columns to preserve data
    op.alter_column('uploaded_videos', 'file_name', new_column_name='filename')
    op.alter_column('uploaded_videos', 'upload_time', new_column_name='upload_timestamp')
    op.alter_column('uploaded_videos', 'uploaded_by', new_column_name='uploader_id')
    
    # Add new filepath column
    op.add_column('uploaded_videos', sa.Column('filepath', sa.String(length=512), nullable=True))
    
    # Update foreign key constraint name
    op.drop_constraint('fk_uploaded_videos_uploaded_by_users', 'uploaded_videos', type_='foreignkey')
    op.create_foreign_key('fk_uploaded_videos_uploader_id_users', 'uploaded_videos', 'users', ['uploader_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    # Drop new foreign key constraint
    op.drop_constraint('fk_uploaded_videos_uploader_id_users', 'uploaded_videos', type_='foreignkey')
    
    # Drop new filepath column
    op.drop_column('uploaded_videos', 'filepath')
    
    # Rename columns back
    op.alter_column('uploaded_videos', 'filename', new_column_name='file_name')
    op.alter_column('uploaded_videos', 'upload_timestamp', new_column_name='upload_time')
    op.alter_column('uploaded_videos', 'uploader_id', new_column_name='uploaded_by')
    
    # Recreate original foreign key constraint
    op.create_foreign_key('fk_uploaded_videos_uploaded_by_users', 'uploaded_videos', 'users', ['uploaded_by'], ['id'], ondelete='SET NULL')
