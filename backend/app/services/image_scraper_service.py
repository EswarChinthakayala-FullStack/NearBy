import httpx
from typing import Any, Dict, List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging_config import logger
from app.crud.crud_image import crud_image
from app.models.image import PlaceImage
from app.models.place import Place
from app.models.sync_log import ContentSyncLog
from app.scrapers.bing_image_scraper import bing_image_scraper
from app.scrapers.wikimedia_fetcher import wikimedia_fetcher
from app.services.storage_service import storage_service
from app.schemas.image import PlaceImageCreate


class ImageScraperService:
    """Multi-provider image sourcing orchestration service (Wikimedia + Bing fallback)."""

    def __init__(self):
        self.wikimedia_fetcher = wikimedia_fetcher
        self.bing_scraper = bing_image_scraper

    async def scrape_and_save_place_images(
        self,
        db: AsyncSession,
        place_id: Optional[int] = None,
        slug: Optional[str] = None,
        limit: int = 3
    ) -> Dict[str, Any]:
        """Fetch candidate images from Wikimedia or Bing scrapers, save to uploads/places, and persist PlaceImage records."""
        if place_id is not None:
            stmt = select(Place).where(Place.id == place_id)
        elif slug is not None:
            stmt = select(Place).where(func.lower(Place.slug) == slug.lower().strip())
        else:
            return {"status": "failed", "message": "Either place_id or slug must be provided"}

        res = await db.execute(stmt)
        place = res.scalars().first()

        if not place:
            return {"status": "failed", "message": f"Place not found (id={place_id}, slug={slug})"}

        candidates: List[Dict[str, Any]] = []

        try:
            # 1. Primary Source: Wikimedia Commons API
            candidates = await self.wikimedia_fetcher.fetch_images(query=place.name, limit=limit)

            # 2. Fallback Source: Bing Image Scraper (if Wikimedia yielded 0 images)
            if not candidates:
                logger.info(f"Wikimedia fetcher returned 0 images for '{place.name}'. Falling back to Bing scraper.")
                bing_query = f"{place.name} {place.city}".strip() if place.city else place.name
                candidates = await self.bing_scraper.fetch_images(query=bing_query, limit=limit)

            if not candidates:
                return {"status": "success", "imported": 0, "message": "No candidate images found"}

            saved_images_count = 0
            headers = {"User-Agent": "NearbyApp/1.0 (contact@nearbyapp.com; https://nearbyapp.com)"}
            async with httpx.AsyncClient(timeout=12.0, headers=headers, follow_redirects=True) as http_client:
                for idx, item in enumerate(candidates[:limit]):
                    img_url = item["image_url"]
                    src = item["source"]

                    try:
                        resp = await http_client.get(img_url)
                        if resp.status_code == 200:
                            file_bytes = resp.content
                            ext = ".jpg" if not img_url.endswith((".png", ".webp")) else img_url[img_url.rfind("."):]
                            filename = f"{place.slug}_{idx}{ext}"

                            # Save file using StorageService
                            save_meta = await storage_service.save_image(
                                file_bytes=file_bytes,
                                original_filename=filename,
                                category="places"
                            )

                            is_cover = (idx == 0)

                            # Persist PlaceImage record
                            image_in = PlaceImageCreate(
                                image_url=save_meta["image_url"],
                                thumbnail_url=save_meta["thumbnail_url"],
                                source=src,
                                is_cover=is_cover,
                                sort_order=idx
                            )
                            await crud_image.add_place_image(db, place_id=place.id, image_in=image_in)
                            saved_images_count += 1

                    except Exception as download_err:
                        logger.warning(f"Failed downloading image {img_url}: {str(download_err)}")
                        continue

            # Record ContentSyncLog
            log = ContentSyncLog(
                place_id=place.id,
                sync_type="wikimedia_image" if candidates[0]["source"] == "wikimedia" else "bing_image",
                status="success",
                message=f"Saved {saved_images_count} images for place '{place.name}'."
            )
            db.add(log)
            await db.commit()

            return {"status": "success", "place_id": place.id, "saved_count": saved_images_count}

        except Exception as e:
            log = ContentSyncLog(
                place_id=place.id,
                sync_type="wikimedia_image",
                status="failed",
                message=str(e)
            )
            db.add(log)
            await db.commit()
            logger.error(f"Image scraping failed for place_id {place_id}: {str(e)}", exc_info=True)
            return {"status": "failed", "place_id": place_id, "error": str(e)}

    async def scrape_all_places_missing_images(
        self,
        db: AsyncSession,
        limit_per_place: int = 3,
        max_places: int = 50
    ) -> Dict[str, Any]:
        """Automatically find places without images and scrape candidate cover images for them."""
        from sqlalchemy import func
        stmt = (
            select(Place)
            .outerjoin(PlaceImage)
            .group_by(Place.id)
            .having(func.count(PlaceImage.id) == 0)
            .limit(max_places)
        )
        res = await db.execute(stmt)
        places = res.scalars().all()

        total_processed = len(places)
        total_images_saved = 0

        for place in places:
            try:
                result = await self.scrape_and_save_place_images(db, place_id=place.id, limit=limit_per_place)
                total_images_saved += result.get("saved_count", 0)
            except Exception as e:
                logger.warning(f"Image scrape failed for place '{place.name}': {e}")

        return {
            "status": "success",
            "total_processed": total_processed,
            "total_images_saved": total_images_saved
        }


image_scraper_service = ImageScraperService()
