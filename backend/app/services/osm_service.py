from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging_config import logger
from app.crud.crud_category import crud_category
from app.crud.crud_place import crud_place
from app.models.sync_log import OsmSyncLog
from app.services.external.osm import OverpassClient


class OSMService:
    """OpenStreetMap ingestion and place normalization service."""

    def __init__(self):
        self.client = OverpassClient()

    async def import_places_for_region(
        self,
        db: AsyncSession,
        region: str = "Delhi"
    ) -> Dict[str, Any]:
        """Fetch tourist places from Overpass API for a region and import new records into places table."""
        logger.info(f"Starting OpenStreetMap place import for region: {region}")

        # Create sync log entry
        sync_log = OsmSyncLog(
            sync_type="overpass_region_import",
            region=region,
            status="running",
            started_at=datetime.now()
        )
        db.add(sync_log)
        await db.commit()
        await db.refresh(sync_log)

        total_fetched = 0
        total_imported = 0
        total_skipped = 0

        try:
            # 1. Build slug -> category_id map
            categories = await crud_category.get_all(db)
            cat_map = {c.slug: c.id for c in categories}
            default_cat_id = cat_map.get("historical", cat_map.get("temple", categories[0].id if categories else 1))

            # 2. Query Overpass API
            raw_places = await self.client.fetch_tourist_places_by_city(city_name=region)
            total_fetched = len(raw_places)

            for raw in raw_places:
                osm_id = raw.get("osm_id")
                name = raw.get("name")
                lat = raw.get("latitude")
                lng = raw.get("longitude")

                if not name or lat is None or lng is None:
                    total_skipped += 1
                    continue

                # Resolve smart category
                cat_id = self._resolve_category_id(name, raw.get("category_tag", ""), cat_map, default_cat_id)

                # Generate slug
                slug = name.lower().replace(" ", "-")

                # Check if place already imported by slug or osm_id
                existing = await crud_place.get_by_slug(db, slug=slug)
                if existing:
                    # Update category if it was incorrectly assigned
                    if existing.category_id != cat_id:
                        existing.category_id = cat_id
                        db.add(existing)
                    total_skipped += 1
                    continue

                create_dict = {
                    "name": name,
                    "slug": slug,
                    "category_id": cat_id,
                    "description": raw.get("description") or f"Tourist location in {region}",
                    "address": raw.get("address"),
                    "city": region,
                    "country": "India",
                    "latitude": float(lat),
                    "longitude": float(lng),
                    "osm_id": osm_id,
                    "osm_type": raw.get("osm_type", "node"),
                    "status": "published",
                    "source": "osm"
                }

                await crud_place.create(db, obj_in=create_dict)
                total_imported += 1

            # Auto-acquire candidate images for newly imported places
            if total_imported > 0:
                try:
                    from app.services.image_scraper_service import image_scraper_service
                    asyncio.create_task(image_scraper_service.scrape_all_places_missing_images(db, max_places=total_imported))
                except Exception as img_err:
                    logger.warning(f"Background image scraping trigger failed: {img_err}")

            # Update sync log
            sync_log.status = "success"
            sync_log.total_fetched = total_fetched
            sync_log.total_imported = total_imported
            sync_log.total_skipped = total_skipped
            sync_log.finished_at = datetime.now()

            db.add(sync_log)
            await db.commit()

            logger.info(f"Completed OSM import for {region}: imported {total_imported}/{total_fetched} places.")
            return {
                "status": "success",
                "region": region,
                "total_fetched": total_fetched,
                "total_imported": total_imported,
                "total_skipped": total_skipped
            }

        except Exception as e:
            sync_log.status = "failed"
            sync_log.error_message = str(e)
            sync_log.finished_at = datetime.now()
            db.add(sync_log)
            await db.commit()
            logger.error(f"OSM import failed for region {region}: {str(e)}", exc_info=True)
            raise

    def _resolve_category_id(self, name: str, category_tag: str, cat_map: Dict[str, int], fallback_id: int) -> int:
        """Intelligently match place name & OSM category tags to database category_id."""
        n_lower = name.lower()
        tag_lower = (category_tag or "").lower()

        # 1. Check place name keywords
        if any(k in n_lower for k in ["temple", "koil", "kovil", "mandir", "church", "mosque", "dargah", "gurdwara", "worship", "shrine", "cathedral", "st.", "saint"]):
            return cat_map.get("temple", fallback_id)
        if any(k in n_lower for k in ["beach", "coast", "seafront", "shore", "bay"]):
            return cat_map.get("beach", fallback_id)
        if any(k in n_lower for k in ["museum", "gallery", "art", "memorial"]):
            return cat_map.get("museum", fallback_id)
        if any(k in n_lower for k in ["park", "garden", "lawn", "zoo", "botanical"]):
            return cat_map.get("park", fallback_id)
        if any(k in n_lower for k in ["fort", "palace", "gate", "tomb", "monument", "ruins", "castle", "heritage", "tower", "arch"]):
            return cat_map.get("historical", fallback_id)
        if any(k in n_lower for k in ["waterfall", "falls", "cascade"]):
            return cat_map.get("waterfall", fallback_id)
        if any(k in n_lower for k in ["viewpoint", "view", "peak", "hill", "lookout"]):
            return cat_map.get("viewpoint", fallback_id)
        if any(k in n_lower for k in ["bazaar", "market", "mall", "shopping"]):
            return cat_map.get("shopping", fallback_id)
        if any(k in n_lower for k in ["sanctuary", "wildlife", "safari", "national park"]):
            return cat_map.get("wildlife", fallback_id)
        if any(k in n_lower for k in ["lake", "river", "valley", "forest", "nature"]):
            return cat_map.get("nature", fallback_id)

        # 2. Check OSM category tags
        if "museum" in tag_lower:
            return cat_map.get("museum", fallback_id)
        if "historic" in tag_lower or "monument" in tag_lower or "castle" in tag_lower:
            return cat_map.get("historical", fallback_id)
        if "place_of_worship" in tag_lower:
            return cat_map.get("temple", fallback_id)
        if "viewpoint" in tag_lower:
            return cat_map.get("viewpoint", fallback_id)
        if "park" in tag_lower or "garden" in tag_lower:
            return cat_map.get("park", fallback_id)
        if "beach" in tag_lower:
            return cat_map.get("beach", fallback_id)

        return fallback_id


osm_service = OSMService()
