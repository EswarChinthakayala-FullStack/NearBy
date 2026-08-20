import re
import datetime
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

CATEGORY_INTENTS = {
    "temple": {
        "intent": "Temple & Spiritual Search",
        "primary_category": "Temple",
        "secondary_categories": ["Shrine", "Religious Monument", "Spiritual"],
        "excluded_categories": ["Restaurant", "Hotel", "Cafe", "Resort", "Shopping Mall", "Pub", "Bar"]
    },
    "waterfall": {
        "intent": "Waterfall & Nature Search",
        "primary_category": "Waterfall",
        "secondary_categories": ["Nature", "Trekking", "Scenic Viewpoint", "Lake"],
        "excluded_categories": ["Shopping Mall", "Hotel", "Restaurant", "Museum"]
    },
    "restaurant": {
        "intent": "Dining & Food Search",
        "primary_category": "Restaurant",
        "secondary_categories": ["Cafe", "Food Court", "Dining", "Bistro"],
        "excluded_categories": ["Temple", "Museum", "Waterfall", "Fort", "Park"]
    },
    "cafe": {
        "intent": "Cafe & Coffee Search",
        "primary_category": "Cafe",
        "secondary_categories": ["Bakery", "Coffee Shop", "Bistro"],
        "excluded_categories": ["Temple", "Museum", "Waterfall", "Fort"]
    },
    "museum": {
        "intent": "Museum & Art Search",
        "primary_category": "Museum",
        "secondary_categories": ["Art Gallery", "Exhibition", "Heritage Site"],
        "excluded_categories": ["Restaurant", "Temple", "Waterfall", "Resort", "Shopping Mall"]
    },
    "fort": {
        "intent": "Historical Fort Search",
        "primary_category": "Fort",
        "secondary_categories": ["Historical Landmark", "Palace", "Heritage Monument"],
        "excluded_categories": ["Restaurant", "Hotel", "Cafe", "Resort"]
    },
    "park": {
        "intent": "Park & Garden Search",
        "primary_category": "Park",
        "secondary_categories": ["Garden", "Nature Reserve", "Lake"],
        "excluded_categories": ["Restaurant", "Hotel", "Shopping Mall"]
    },
    "beach": {
        "intent": "Beach & Coastal Search",
        "primary_category": "Beach",
        "secondary_categories": ["Coastal Viewpoint", "Sunset Point"],
        "excluded_categories": ["Museum", "Temple", "Shopping Mall"]
    }
}

class IntentAnalysisService:
    """Natural Language Intent Analysis Engine for extracting user search semantics."""

    def analyze_intent(self, query: str) -> Dict[str, Any]:
        q_lower = query.lower().strip()

        # 1. Determine current time context
        hour = datetime.datetime.now().hour
        if 5 <= hour < 12:
            time_context = "Morning"
        elif 12 <= hour < 17:
            time_context = "Afternoon"
        elif 17 <= hour < 21:
            time_context = "Evening"
        else:
            time_context = "Night"

        # 2. Match category intent
        matched_intent = None
        for key, intent_data in CATEGORY_INTENTS.items():
            if key in q_lower:
                matched_intent = intent_data
                break

        if not matched_intent:
            if any(w in q_lower for w in ["history", "heritage", "monument", "historic"]):
                matched_intent = {
                    "intent": "Historical & Heritage Search",
                    "primary_category": "Historical",
                    "secondary_categories": ["Fort", "Museum", "Monument", "Palace"],
                    "excluded_categories": ["Restaurant", "Hotel", "Resort"]
                }
            elif any(w in q_lower for w in ["nature", "scenic", "view", "sunset", "mountain", "hill"]):
                matched_intent = {
                    "intent": "Nature & Scenic Search",
                    "primary_category": "Nature",
                    "secondary_categories": ["Waterfall", "Park", "Viewpoint", "Lake"],
                    "excluded_categories": ["Shopping Mall", "Hotel"]
                }
            elif any(w in q_lower for w in ["food", "dining", "eat"]):
                matched_intent = {
                    "intent": "Dining & Food Search",
                    "primary_category": "Restaurant",
                    "secondary_categories": ["Cafe", "Food Court"],
                    "excluded_categories": ["Temple", "Museum", "Waterfall"]
                }

        if not matched_intent:
            matched_intent = {
                "intent": "General Nearby Tourism Search",
                "primary_category": "Attraction",
                "secondary_categories": [],
                "excluded_categories": []
            }

        return {
            "query": query,
            "intent": matched_intent["intent"],
            "primary_category": matched_intent["primary_category"],
            "secondary_categories": matched_intent.get("secondary_categories", []),
            "excluded_categories": matched_intent.get("excluded_categories", []),
            "time_context": time_context,
            "weather_context": "Pleasant"
        }

intent_analysis_service = IntentAnalysisService()
