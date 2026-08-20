import sys
import os
import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import AsyncSessionFactory
from app.models.place import Place
from app.models.image import PlaceImage
from app.utils.image_helpers import get_place_cover_image

async def seed_place_images():
    async with AsyncSessionFactory() as db:
        stmt = select(Place).options(selectinload(Place.images), selectinload(Place.category))
        res = await db.execute(stmt)
        places = res.scalars().all()

        added_count = 0
        for place in places:
            if not place.images or len(place.images) == 0:
                cover_url = get_place_cover_image(place)
                img = PlaceImage(
                    place_id=place.id,
                    image_url=cover_url,
                    thumbnail_url=cover_url,
                    source="admin",
                    is_cover=True,
                    sort_order=0
                )
                db.add(img)
                added_count += 1

        await db.commit()
        print(f"Successfully seeded cover images for {added_count} tourist places!")

if __name__ == "__main__":
    asyncio.run(seed_place_images())
