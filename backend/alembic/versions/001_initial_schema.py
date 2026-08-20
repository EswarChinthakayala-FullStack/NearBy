"""Initial Database Schema Migration matching schema.sql 1:1

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-26 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Users table
    op.create_table(
        'users',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('uuid', sa.CHAR(36), nullable=False),
        sa.Column('full_name', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('role', sa.Enum('user', 'admin', name='userrole'), server_default='user', nullable=False),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid', name='uk_users_uuid'),
        sa.UniqueConstraint('email', name='uk_users_email')
    )

    # 2. Refresh Tokens table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('token', sa.String(length=512), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_refresh_tokens_user_id_users'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token', name='uk_refresh_tokens_token')
    )

    # 3. Categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('uuid', sa.CHAR(36), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=120), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid', name='uk_categories_uuid'),
        sa.UniqueConstraint('name', name='uk_categories_name'),
        sa.UniqueConstraint('slug', name='uk_categories_slug')
    )

    # 4. Places table
    op.create_table(
        'places',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('uuid', sa.CHAR(36), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=280), nullable=False),
        sa.Column('category_id', sa.BigInteger(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('history', sa.Text(), nullable=True),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), server_default='India', nullable=False),
        sa.Column('latitude', sa.Numeric(precision=10, scale=7), nullable=False),
        sa.Column('longitude', sa.Numeric(precision=10, scale=7), nullable=False),
        sa.Column('osm_id', sa.BigInteger(), nullable=True),
        sa.Column('osm_type', sa.String(length=20), nullable=True),
        sa.Column('entry_fee', sa.String(length=255), nullable=True),
        sa.Column('best_time_to_visit', sa.String(length=255), nullable=True),
        sa.Column('status', sa.Enum('draft', 'published', 'archived', name='placestatus'), server_default='published', nullable=False),
        sa.Column('avg_rating', sa.Numeric(precision=3, scale=2), server_default='0.00', nullable=False),
        sa.Column('total_reviews', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_favorites', sa.Integer(), server_default='0', nullable=False),
        sa.Column('source', sa.Enum('osm', 'admin', name='placesource'), server_default='osm', nullable=False),
        sa.Column('created_by', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='RESTRICT', name='fk_places_category_id_categories'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='SET NULL', name='fk_places_created_by_users'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid', name='uk_places_uuid'),
        sa.UniqueConstraint('slug', name='uk_places_slug')
    )

    # 5. Place Timings table
    op.create_table(
        'place_timings',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('place_id', sa.BigInteger(), nullable=False),
        sa.Column('day_of_week', sa.SmallInteger(), nullable=False),
        sa.Column('opening_time', sa.Time(), nullable=True),
        sa.Column('closing_time', sa.Time(), nullable=True),
        sa.Column('is_closed', sa.Boolean(), server_default='0', nullable=False),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='CASCADE', name='fk_place_timings_place_id_places'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('place_id', 'day_of_week', name='uk_place_timings_place_day')
    )

    # 6. Place Images table
    op.create_table(
        'place_images',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('uuid', sa.CHAR(36), nullable=False),
        sa.Column('place_id', sa.BigInteger(), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=False),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('source', sa.Enum('wikimedia', 'bing', 'admin', 'user', name='imagesource'), server_default='admin', nullable=False),
        sa.Column('uploaded_by', sa.BigInteger(), nullable=True),
        sa.Column('is_cover', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('sort_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='CASCADE', name='fk_place_images_place_id_places'),
        sa.ForeignKeyConstraint(['uploaded_by'], ['users.id'], ondelete='SET NULL', name='fk_place_images_uploaded_by_users'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid', name='uk_place_images_uuid')
    )

    # 7. Reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('uuid', sa.CHAR(36), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('place_id', sa.BigInteger(), nullable=False),
        sa.Column('rating', sa.SmallInteger(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', name='reviewstatus'), server_default='approved', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='CASCADE', name='fk_reviews_place_id_places'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_reviews_user_id_users'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid', name='uk_reviews_uuid'),
        sa.UniqueConstraint('user_id', 'place_id', name='uk_reviews_user_place')
    )

    # 8. Favorites table
    op.create_table(
        'favorites',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('place_id', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['place_id'], ['places.id'], ondelete='CASCADE', name='fk_favorites_place_id_places'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_favorites_user_id_users'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'place_id', name='uk_favorites_user_place')
    )


def downgrade() -> None:
    op.drop_table('favorites')
    op.drop_table('reviews')
    op.drop_table('place_images')
    op.drop_table('place_timings')
    op.drop_table('places')
    op.drop_table('categories')
    op.drop_table('refresh_tokens')
    op.drop_table('users')
