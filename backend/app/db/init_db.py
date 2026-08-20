import asyncio
import re
from typing import List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging_config import logger
from app.core.security import get_password_hash
from app.models.category import Category
from app.models.user import User

# Default Tourist Place Categories
DEFAULT_CATEGORIES: List[Tuple[str, str, str]] = [
    ("Temple", "religious-temple-icon", "Sacred temples, shrines, and places of worship."),
    ("Beach", "beach-icon", "Scenic coastal beaches, shores, and marine destinations."),
    ("Museum", "museum-icon", "Historical museums, art galleries, and cultural centers."),
    ("Park", "park-icon", "Public parks, gardens, and urban green spaces."),
    ("Historical", "historical-fort-icon", "Monuments, ancient forts, ruins, and heritage sites."),
    ("Nature", "nature-icon", "Lakes, mountains, valleys, and natural attractions."),
    ("Wildlife", "wildlife-icon", "National parks, sanctuaries, and zoos."),
    ("Shopping", "shopping-icon", "Traditional bazaars, local markets, and shopping centers."),
    ("Waterfall", "waterfall-icon", "Scenic waterfalls and cascades."),
    ("Viewpoint", "viewpoint-icon", "Panoramic scenic viewpoints and hilltops.")
]


def _slugify(name: str) -> str:
    """Generate URL-safe slug from name."""
    text = name.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)


async def init_db(db: AsyncSession) -> None:
    """Idempotent database initialization bootstrapping default categories and initial administrator account."""
    logger.info("Database bootstrap initialization started.")

    try:
        # 1. Seed Default Categories (Idempotent)
        existing_categories_res = await db.execute(select(Category.name))
        existing_names = set(existing_categories_res.scalars().all())

        new_categories_added = 0
        for name, icon, desc in DEFAULT_CATEGORIES:
            if name not in existing_names:
                category = Category(
                    name=name,
                    slug=_slugify(name),
                    icon=icon,
                    description=desc
                )
                db.add(category)
                new_categories_added += 1

        if new_categories_added > 0:
            logger.info(f"Seeded {new_categories_added} new default tourist place categories.")
        else:
            logger.info("Default categories already present in database.")

        # 2. Seed Initial Administrative User (Idempotent)
        admin_res = await db.execute(select(User).where(User.email == settings.FIRST_ADMIN_EMAIL))
        existing_admin = admin_res.scalars().first()

        if not existing_admin:
            admin_user = User(
                full_name=settings.FIRST_ADMIN_NAME,
                email=settings.FIRST_ADMIN_EMAIL,
                password_hash=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            logger.info(f"Created initial administrative user account: {settings.FIRST_ADMIN_EMAIL}")
        else:
            logger.info(f"Initial administrative user account '{settings.FIRST_ADMIN_EMAIL}' already exists.")

        await db.commit()
        logger.info("Database bootstrap initialization completed successfully.")

    except Exception as e:
        await db.rollback()
        logger.error(f"Database bootstrap initialization failed: {str(e)}", exc_info=True)
        raise
