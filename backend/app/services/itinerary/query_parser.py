import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

TRIP_TYPE_KEYWORDS = {
    "romantic": "Romantic & Couples",
    "family": "Family Friendly",
    "adventure": "Adventure & Nature",
    "food": "Food & Culinary",
    "solo": "Solo Backpacking",
    "photography": "Photography & Scenic",
    "heritage": "Heritage & Culture",
    "weekend": "Weekend Getaway",
    "relax": "Peaceful Relaxation"
}

class QueryParserService:
    """Natural Language Query Parser for extracting destination, duration, and trip intent."""

    def parse_query(self, query: str, explicit_dest: Optional[str] = None, explicit_days: Optional[int] = None) -> Dict[str, Any]:
        q_clean = query.strip()
        q_lower = q_clean.lower()

        # 1. Duration extraction (e.g. "3 days", "3-day", "2 days", "one day", "weekend")
        days = explicit_days if (explicit_days is not None and explicit_days > 0) else None

        if days is None:
            day_match = re.search(r'(\d+)\s*(-|\s)*day', q_lower)
            if day_match:
                days = min(max(int(day_match.group(1)), 1), 14)
            elif "one-day" in q_lower or "one day" in q_lower or "1 day" in q_lower or "day trip" in q_lower:
                days = 1
            elif "two-day" in q_lower or "two days" in q_lower or "2 days" in q_lower or "weekend" in q_lower:
                days = 2
            elif "three-day" in q_lower or "three days" in q_lower or "3 days" in q_lower:
                days = 3
            elif "week" in q_lower or "7 days" in q_lower:
                days = 7
            else:
                days = 2

        # 2. Destination extraction using preposition patterns ("to Mysore", "in Coorg", "for Hyderabad")
        destination = explicit_dest or ""
        if not destination:
            dest_match = re.search(r'(?:to|in|for|around)\s+([A-Za-z\s]+?)(?:\s+(?:with|for|during|trip|vacation|itinerary|tour|solo|family|adventure)|$)', q_clean, re.IGNORECASE)
            if dest_match:
                destination = dest_match.group(1).strip()

        if not destination:
            # Fallback regex matching capitalized city names or last words
            words = [w for w in q_clean.split() if w.lower() not in {"plan", "a", "trip", "itinerary", "for", "in", "to", "days", "day", "weekend", "vacation"}]
            destination = words[-1] if words else "Hyderabad"

        # Clean destination string
        destination = re.sub(r'[^\w\s]', '', destination).strip()

        # 3. Trip type extraction
        trip_type = "Sightseeing"
        for kw, category in TRIP_TYPE_KEYWORDS.items():
            if kw in q_lower:
                trip_type = category
                break

        return {
            "query": query,
            "destination": destination,
            "days": days,
            "trip_type": trip_type
        }

query_parser_service = QueryParserService()
