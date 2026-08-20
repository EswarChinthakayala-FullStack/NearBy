import asyncio
import sys
from app.db.init_db import DEFAULT_CATEGORIES
from app.db.session import AsyncSessionFactory
from app.crud.crud_category import crud_category
from app.schemas.category import CategoryCreate


async def seed_categories():
    """Idempotently seed default tourist place categories into database."""
    print("==================================================")
    print("   Nearby Category Seeding Script")
    print("==================================================")

    async with AsyncSessionFactory() as db:
        seeded_count = 0
        skipped_count = 0

        for cat_data in DEFAULT_CATEGORIES:
            existing = await crud_category.get_by_name(db, name=cat_data["name"])
            if existing:
                skipped_count += 1
                continue

            create_schema = CategoryCreate(
                name=cat_data["name"],
                slug=cat_data["slug"],
                icon=cat_data["icon"],
                description=cat_data["description"]
            )
            await crud_category.create(db, obj_in=create_schema)
            seeded_count += 1

        print(f"Category Seeding Complete:")
        print(f"  - Categories Seeded:  {seeded_count}")
        print(f"  - Existing Skipped:   {skipped_count}")


if __name__ == "__main__":
    try:
        asyncio.run(seed_categories())
        sys.exit(0)
    except Exception as err:
        print(f"ERROR: Seeding failed - {str(err)}", file=sys.stderr)
        sys.exit(1)
