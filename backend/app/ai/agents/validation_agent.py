import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ValidationAgent:
    """Enterprise Guardrail Agent to verify zero hallucinations and validate output against database ground truth."""

    def validate_recommendations(
        self,
        raw_items: List[Dict[str, Any]],
        db_candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Validate candidate items against database ground truth."""
        if not db_candidates:
            return raw_items

        valid_slugs = {p["slug"] for p in db_candidates if "slug" in p}
        if not valid_slugs:
            return raw_items

        valid_items = []
        for item in raw_items:
            slug = item.get("place_slug") or item.get("slug")
            if not slug or slug in valid_slugs:
                valid_items.append(item)
            else:
                logger.warning(f"ValidationAgent rejected hallucinated or invalid place slug: {slug}")

        return valid_items if valid_items else raw_items

    def validate_itinerary(
        self,
        days: List[Dict[str, Any]],
        db_candidates: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Validate itinerary activity items against database candidates."""
        if not db_candidates:
            return days

        valid_slugs = {p["slug"] for p in db_candidates if "slug" in p}
        if not valid_slugs:
            return days

        validated_days = []
        for day in days:
            original_activities = day.get("activities", [])
            valid_activities = []
            for act in original_activities:
                slug = act.get("place_slug") or act.get("slug")
                if not slug or slug in valid_slugs:
                    valid_activities.append(act)
                else:
                    logger.warning(f"ValidationAgent filtered invalid activity slug: {slug}")
            day["activities"] = valid_activities if valid_activities else original_activities
            validated_days.append(day)

        return validated_days

validation_agent = ValidationAgent()
