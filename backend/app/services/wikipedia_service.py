import re
from typing import Any, Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging_config import logger
from app.models.place import Place
from app.models.sync_log import ContentSyncLog
from app.services.external.wikipedia import WikipediaClient


def clean_wikipedia_text(text: str) -> str:
    """Sanitize Wikipedia summary text removing references, HTML tags, and bracket artifacts."""
    if not text:
        return ""
    # Remove HTML tags
    cleaned = re.sub(r'<[^>]+>', '', text)
    # Remove bracket references e.g. [1], [citation needed]
    cleaned = re.sub(r'\[\d+\]|\[citation needed\]', '', cleaned)
    # Remove multiple spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


class WikipediaService:
    """Wikipedia place description and history enrichment service."""

    def __init__(self):
        self.client = WikipediaClient()

    async def enrich_place_content(
        self,
        db: AsyncSession,
        place_id: int
    ) -> Dict[str, Any]:
        """Fetch Wikipedia summary/extract for a place and update description and history fields."""
        stmt = select(Place).where(Place.id == place_id)
        res = await db.execute(stmt)
        place = res.scalars().first()

        if not place:
            return {"status": "failed", "message": f"Place with ID {place_id} not found."}

        try:
            summary_data = await self.client.get_page_summary(title=place.name) or {}
            extract = summary_data.get("extract") or ""
            description = summary_data.get("description") or ""

            cleaned_extract = clean_wikipedia_text(extract)
            cleaned_description = clean_wikipedia_text(description)

            if cleaned_extract:
                place.description = cleaned_extract
            if cleaned_description:
                place.history = f"Wikipedia Context: {cleaned_description}. {cleaned_extract}"

            db.add(place)

            # Record content sync log
            log = ContentSyncLog(
                place_id=place.id,
                sync_type="wikipedia",
                status="success",
                message=f"Enriched content for '{place.name}' from Wikipedia."
            )
            db.add(log)
            await db.commit()

            logger.info(f"Successfully enriched place '{place.name}' (ID {place.id}) with Wikipedia content.")
            return {"status": "success", "place_id": place.id, "title": place.name}

        except Exception as e:
            log = ContentSyncLog(
                place_id=place.id,
                sync_type="wikipedia",
                status="failed",
                message=str(e)
            )
            db.add(log)
            await db.commit()
            logger.error(f"Wikipedia enrichment failed for place_id {place_id}: {str(e)}", exc_info=True)
            return {"status": "failed", "place_id": place_id, "error": str(e)}

    async def enrich_all_places_content(
        self,
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Fetch Wikipedia summaries for places and update missing description and history fields."""
        stmt = select(Place).where((Place.description == None) | (Place.description == ""))
        res = await db.execute(stmt)
        places = list(res.scalars().all())

        if not places:
            stmt_all = select(Place).limit(20)
            res_all = await db.execute(stmt_all)
            places = list(res_all.scalars().all())

        success_count = 0
        failed_count = 0

        for place in places:
            res = await self.enrich_place_content(db, place_id=place.id)
            if res.get("status") == "success":
                success_count += 1
            else:
                failed_count += 1

        return {
            "status": "success",
            "total_processed": len(places),
            "enriched_count": success_count,
            "failed_count": failed_count
        }


wikipedia_service = WikipediaService()
