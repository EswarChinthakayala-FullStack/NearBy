import logging
from typing import List, Dict, Any
from app.services.mistral_service import generate_mistral_search_summary
from app.services.search.intent_analysis_service import intent_analysis_service
from app.services.weather.weather_service import weather_service

logger = logging.getLogger(__name__)

class AIRecommendationService:
    """AI Recommendation Engine for intent-aware ranking, grouping, and contextual reasons."""

    async def rank_and_recommend(
        self,
        query: str,
        location_context: Dict[str, Any],
        candidate_places: List[Dict[str, Any]]
    ) -> Dict[str, Any]:

        intent_info = intent_analysis_service.analyze_intent(query)
        city_name = location_context.get("administrative_hierarchy", {}).get("city", "your area")

        # Fetch live weather asynchronously
        try:
            coords = location_context.get("coordinates", {})
            lat = coords.get("latitude", 17.3850)
            lng = coords.get("longitude", 78.4867)
            w_res = await weather_service.get_current_weather(lat, lng)
            weather_ctx = f"{w_res.get('temperature_c', 26)}°C {w_res.get('condition', 'Pleasant')}"
        except Exception:
            weather_ctx = "Pleasant Weather"

        query_understanding = {
            "intent": intent_info["intent"],
            "primary_category": intent_info["primary_category"],
            "secondary_categories": intent_info["secondary_categories"],
            "weather_context": weather_ctx,
            "time_context": intent_info["time_context"]
        }

        if not candidate_places:
            return {
                "summary": f"No specific attractions matched '{query}' near {city_name}. Try broadening your search terms.",
                "query_understanding": query_understanding,
                "recommendation_groups": [],
                "recommendations": []
            }

        # Format candidates for Mistral AI
        places_for_ai = [
            {
                "uuid": p["uuid"],
                "name": p["name"],
                "slug": p["slug"],
                "city": p["city"],
                "category_name": p["category_name"],
                "distance_km": p["distance_km"],
                "rating": p["rating"],
                "confidence": p.get("confidence", 90)
            }
            for p in candidate_places
        ]

        # Call Mistral Large for contextual summary synthesis
        ai_res = await generate_mistral_search_summary(
            query=query,
            places=places_for_ai,
            user_location=city_name
        )

        summary_text = ai_res.get("summary") or f"Found {len(candidate_places)} recommended places near {city_name} matching '{query}' based on user intent relevance."

        # Group candidate places into sections
        perfect_matches = []
        highly_recommended = []
        popular_nearby = []
        hidden_gems = []

        q_lower = query.lower()

        for p in candidate_places:
            cat = p['category_name'].lower()
            name = p['name'].lower()
            dist = p['distance_km']
            city = p['city']
            confidence = p.get('confidence', 90)

            # Generate intelligent, topic-aware reason
            if "temple" in q_lower or "temple" in name or "spiritual" in cat:
                reason = f"Excellent match for your request. Open now and highly rated for peaceful visits in {city} ({dist} km away)."
            elif "waterfall" in q_lower or "waterfall" in name or "falls" in cat:
                reason = f"Breathtaking natural waterfall destination located {dist} km away in {city}, offering scenic cascades."
            elif "cafe" in q_lower or "restaurant" in q_lower or "food" in q_lower:
                reason = f"Top-rated food & dining spot in {city} ({dist} km away), renowned for delicious local specialties."
            elif "museum" in q_lower or "fort" in q_lower or "history" in q_lower:
                reason = f"Famous historical landmark located {dist} km away in {city}, ideal for exploring cultural heritage."
            else:
                reason = f"Top-rated {p['category_name']} destination located {dist} km away in {city}, matching your query for '{query}'."

            item = {
                "place_uuid": p["uuid"],
                "place_name": p["name"],
                "place_slug": p["slug"],
                "category": p["category_name"],
                "rating": p["rating"],
                "distance_km": p["distance_km"],
                "confidence": confidence,
                "reason": reason,
                "cover_image": p["cover_image"],
                "latitude": p["latitude"],
                "longitude": p["longitude"]
            }

            if confidence >= 85:
                perfect_matches.append(item)
            elif confidence >= 70:
                highly_recommended.append(item)
            elif p.get("total_reviews", 0) > 30:
                popular_nearby.append(item)
            else:
                hidden_gems.append(item)

        groups = []
        if perfect_matches:
            groups.append({"title": "Perfect Matches", "items": perfect_matches})
        if highly_recommended:
            groups.append({"title": "Highly Recommended", "items": highly_recommended})
        if popular_nearby:
            groups.append({"title": "Popular Nearby", "items": popular_nearby})
        if hidden_gems:
            groups.append({"title": "Hidden Gems", "items": hidden_gems})

        # Flat list for backward compatibility
        all_items = perfect_matches + highly_recommended + popular_nearby + hidden_gems

        return {
            "summary": summary_text,
            "query_understanding": query_understanding,
            "recommendation_groups": groups if groups else [{"title": "Recommendations", "items": all_items}],
            "recommendations": all_items
        }

ai_recommendation_service = AIRecommendationService()
