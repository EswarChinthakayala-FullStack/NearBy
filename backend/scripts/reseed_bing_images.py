import sys
import os
import asyncio
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import AsyncSessionFactory
from app.models.place import Place
from app.models.image import PlaceImage
from app.scrapers.bing_image_scraper import bing_image_scraper
from app.utils.image_helpers import get_place_cover_image

async def reseed_relevant_bing_images():
    async with AsyncSessionFactory() as db:
        # Delete all old place images cleanly
        await db.execute(delete(PlaceImage))
        await db.commit()

        stmt = select(Place)
        res = await db.execute(stmt)
        places = res.scalars().all()

        for place in places:
            # Fetch fresh, strictly relevant Bing images with Revolyx title filter & Bing CDN URLs
            results = await bing_image_scraper.fetch_images(query=place.name, limit=7)

            added = 0
            seen_urls = set()
            for idx, item in enumerate(results):
                img_url = item.get("image_url")
                if img_url and img_url not in seen_urls:
                    seen_urls.add(img_url)
                    img_rec = PlaceImage(
                        place_id=place.id,
                        image_url=img_url,
                        thumbnail_url=item.get("thumbnail_url") or img_url,
                        source="bing",
                        is_cover=(idx == 0),
                        sort_order=idx
                    )
                    db.add(img_rec)
                    added += 1

            if results and results[0].get("image_url"):
                place.cover_image_url = results[0]["image_url"]

            db.add(place)
            print(f"Reseeded {added} relevant Bing images for place: '{place.name}'")

        await db.commit()
        print("Done reseeding relevant Bing images!")

if __name__ == "__main__":
    asyncio.run(reseed_relevant_bing_images())
