from typing import Dict, Any, List
from app.schemas.ai.nearby_schema import (
    AINearbyResponse,
    RecommendationItemSchema,
    RecommendationGroupSchema,
    QueryUnderstandingSchema
)

class AIResponseFormatter:
    """Formats raw AI recommendation dicts into production-ready AINearbyResponse models."""

    @staticmethod
    def format_response(raw_data: Dict[str, Any]) -> AINearbyResponse:
        summary = raw_data.get("summary", "Recommended places nearby based on your location.")
        qu_raw = raw_data.get("query_understanding", {})
        query_understanding = QueryUnderstandingSchema(
            intent=str(qu_raw.get("intent", "General Search")),
            primary_category=str(qu_raw.get("primary_category", "Attraction")),
            secondary_categories=qu_raw.get("secondary_categories", []),
            weather_context=str(qu_raw.get("weather_context", "Pleasant Weather")),
            time_context=str(qu_raw.get("time_context", "Daytime")),
            active_agents=qu_raw.get("active_agents", ["Query Intent Specialist", "Geospatial & Weather Specialist", "Tourism Recommendation Architect", "ValidationAgent", "FormatterAgent"])
        )

        groups_raw = raw_data.get("recommendation_groups", [])
        recommendation_groups: List[RecommendationGroupSchema] = []

        for g in groups_raw:
            items_list: List[RecommendationItemSchema] = []
            for r in g.get("items", []):
                items_list.append(
                    RecommendationItemSchema(
                        place_uuid=str(r.get("place_uuid", "")),
                        place_name=str(r.get("place_name", "Destination")),
                        place_slug=str(r.get("place_slug", "destination")),
                        category=str(r.get("category", "Attraction")),
                        rating=float(r.get("rating", 4.5)),
                        distance_km=float(r.get("distance_km", 0.0)),
                        confidence=int(r.get("confidence", 90)),
                        reason=str(r.get("reason", "Highly recommended nearby place.")),
                        cover_image=str(r.get("cover_image", "")),
                        latitude=float(r.get("latitude", 0.0)),
                        longitude=float(r.get("longitude", 0.0))
                    )
                )
            recommendation_groups.append(
                RecommendationGroupSchema(
                    title=str(g.get("title", "Recommendations")),
                    items=items_list
                )
            )

        # Flat recommendations list for backward compatibility
        recs_raw = raw_data.get("recommendations", [])
        recommendations: List[RecommendationItemSchema] = []
        for r in recs_raw:
            recommendations.append(
                RecommendationItemSchema(
                    place_uuid=str(r.get("place_uuid", "")),
                    place_name=str(r.get("place_name", "Destination")),
                    place_slug=str(r.get("place_slug", "destination")),
                    category=str(r.get("category", "Attraction")),
                    rating=float(r.get("rating", 4.5)),
                    distance_km=float(r.get("distance_km", 0.0)),
                    confidence=int(r.get("confidence", 90)),
                    reason=str(r.get("reason", "Highly recommended nearby place.")),
                    cover_image=str(r.get("cover_image", "")),
                    latitude=float(r.get("latitude", 0.0)),
                    longitude=float(r.get("longitude", 0.0))
                )
            )

        return AINearbyResponse(
            summary=summary,
            query_understanding=query_understanding,
            recommendation_groups=recommendation_groups,
            recommendations=recommendations
        )

ai_response_formatter = AIResponseFormatter()
