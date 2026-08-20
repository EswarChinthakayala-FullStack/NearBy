import logging
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.search.nearby_search_service import nearby_search_service

logger = logging.getLogger(__name__)

async def tourism_search_tool(
    db: AsyncSession,
    latitude: float,
    longitude: float,
    query: str,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """LangChain / CrewAI tool for querying PostgreSQL database using hybrid spatial & intent search."""
    try:
        results = await nearby_search_service.search_nearby(
            db=db,
            latitude=latitude,
            longitude=longitude,
            query=query,
            radius_km=50.0,
            limit=limit
        )
        return results
    except Exception as e:
        logger.error(f"Error in tourism_search_tool: {e}")
        return []
